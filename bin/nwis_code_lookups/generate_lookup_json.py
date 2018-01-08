#!/usr/bin/env python3.6

import json

from nwis_lookups import get_dict_from_rdb, translate_to_lookup, translate_codes_by_group
from wqp_lookups import get_lookup_by_json, get_nwis_state_lookup, get_nwis_county_lookup, is_us_county
"""
Generates a json object that will contain keys for the various codes used in NWIS site info expanded service
"""

CODE_ENDPOINT = 'https://help.waterdata.usgs.gov/code'

CODE_LOOKUP_CONFIG = [
    {'code_key': 'agency_cd', 'name': 'party_nm', 'url': '{0}/agency_cd_querya'.format(CODE_ENDPOINT), 'site_key': 'agency_cd'},
#    {'code_key': 'site_tp_cd', 'name': 'site_tp_ln', 'desc': 'site_tp_ds', 'url': '{0}/site_tp_query'.format(CODE_ENDPOINT), 'site_key': 'site_tp_cd'},
#    {'code_key': 'parm_cd', 'name': 'parm_nm', 'url': '{0}/parameter_cd_query'.format(CODE_ENDPOINT), 'params' : {'group_cd': '%'}, 'site_key': 'parm_cd'},
#    {'code_key': 'Code', 'name': 'Description', 'url': '{0}/alt_datum_cd_query'.format(CODE_ENDPOINT), 'site_key': 'alt_datum_cd'},
#    {'code_key': 'gw_ref_cd', 'name': 'gw_ref_ds', 'url': '{0}/alt_meth_cd_query'.format(CODE_ENDPOINT), 'site_key': 'alt_meth_cd'},
#    {'code_key': 'Code', 'name': 'Description', 'url': '{0}/aqfr_type_cd_query'.format(CODE_ENDPOINT), 'site_key': 'aqfr_type_cd'},
#    {'code_key': 'gw_ref_cd', 'name': 'gw_ref_ds', 'url': '{0}/coord_acy_cd_query'.format(CODE_ENDPOINT), 'site_key': 'coord_acy_cd'},
#    {'code_key': 'gw_ref_cd', 'name': 'gw_ref_ds', 'url': '{0}/coord_meth_cd_query'.format(CODE_ENDPOINT), 'site_key': 'coord_meth_cd'},
#    {'code_key': 'gw_ref_cd', 'name': 'gw_ref_ds', 'url': '{0}/reliability_cd_query'.format(CODE_ENDPOINT), 'site_key': 'reliability_cd'},
#    {'code_key': 'gw_ref_cd', 'name': 'gw_ref_nm', 'desc': 'gw_ref_ds', 'url': '{0}/topo_cd_query'.format(CODE_ENDPOINT), 'site_key': 'topo_cd'}
]

GROUPED_CODE_LOOKUP_CONFIG = [
    {'code_key': 'nat_aqfr_cd', 'name': 'nat_aqfr_nm', 'url': '{0}/nat_aqfr_query'.format(CODE_ENDPOINT), 'site_key': 'nat_aqfr_cd'},
#    {'code_key': 'aqfr_cd', 'name': 'aqfr_nm', 'url': '{0}/aqfr_cd_query'.format(CODE_ENDPOINT), 'site_key': 'aqfr_cd'}
]

WQP_LOOKUP_ENDPOINT = 'https://www.waterqualitydata.us/Codes'

COUNTRY_CODES = ['US', 'CA']


def generate_lookup_file(filename='nwis_lookup.json'):
    lookups = {}
    for lookup_config in CODE_LOOKUP_CONFIG:
        code_dict_iter = get_dict_from_rdb(lookup_config.get('url'), params=lookup_config.get('params', None))
        lookups[lookup_config.get('site_key')] = translate_to_lookup(
            code_dict_iter,
            lookup_config.get('code_key'),
            lookup_config.get('name'),
            lookup_config.get('desc', '')
        )
    for lookup_config in GROUPED_CODE_LOOKUP_CONFIG:
        code_dict_iter = get_dict_from_rdb(lookup_config.get('url'))
        lookups[lookup_config.get('site_key')] = translate_codes_by_group(
            code_dict_iter,
            lookup_config.get('code_key'),
            lookup_config.get('name'))

    with open(filename, 'w') as f:
        f.write(json.dumps(lookups, indent=4))


def generate_country_state_county_file(filename='nwis_country_state_lookup.json'):
    lookups = {}
    for country in COUNTRY_CODES:
        lookup_dict = get_lookup_by_json('{0}/statecode'.format(WQP_LOOKUP_ENDPOINT), {'countrycode': country})
        lookups[country] = {'state_cd': get_nwis_state_lookup(lookup_dict.get('codes', []))}

    county_lookup = get_lookup_by_json('{0}/countycode'.format(WQP_LOOKUP_ENDPOINT))
    us_county_lookups = filter(is_us_county, county_lookup.get('codes', []))
    state_with_county_lookups = get_nwis_county_lookup(us_county_lookups)

    for state in state_with_county_lookups.keys():
        lookups['US']['state_cd'][state]['county_cd'] = state_with_county_lookups[state]

    with open(filename, 'w') as f:
        f.write(json.dumps(lookups, indent=4))


if __name__ == '__main__':
    generate_lookup_file()
    generate_country_state_county_file()
