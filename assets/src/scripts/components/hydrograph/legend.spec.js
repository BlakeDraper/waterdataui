const { select } = require('d3-selection');

const { drawSimpleLegend, legendDisplaySelector, createLegendMarkers } = require('./legend');
const { lineMarker, circleMarker, rectangleMarker } = require('./markers');

describe('Legend module', () => {

    describe('drawSimpleLegend', () => {

        let svgNode;

        let legendMarkers = [
            {
                type: lineMarker,
                length: 20,
                domId: 'some-id',
                domClass: 'some-class',
                text: 'Some Text',
                groupId: 'my-line-marker'
            },
            {
                type: circleMarker,
                r: 4,
                domId: null,
                domClass: 'some-other-class',
                text: 'Circle Text'
            }
        ];

        beforeEach(() => {
            svgNode = select('body').append('svg')
                .style('width', '800px')
                .style('height', '400px')
                .attr('viewBox', '0 0 800 400')
                .attr('preserveAspectRatio', 'xMinYMin meet');
        });

        afterEach(() => {
            svgNode.remove();
        });

        it('Adds a legend when width is not provided', () => {
            drawSimpleLegend(svgNode, legendMarkers);
            expect(svgNode.selectAll('.legend').size()).toBe(1);
            expect(svgNode.selectAll('line').size()).toBe(1);
            expect(svgNode.selectAll('circle').size()).toBe(1);
            expect(svgNode.selectAll('text').size()).toBe(2);
            let line = svgNode.select('line');
            expect(line.attr('x1')).toBe('0');
            expect(line.attr('x2')).toBe('20');
            let circle = svgNode.select('circle');
            expect(circle.attr('class')).toBe('some-other-class');
        });


        it('Adds a legend when width is provided', () => {
            drawSimpleLegend(svgNode, legendMarkers, 200);
            expect(svgNode.selectAll('.legend').size()).toBe(1);
            expect(svgNode.selectAll('line').size()).toBe(1);
            expect(svgNode.selectAll('circle').size()).toBe(1);
            expect(svgNode.selectAll('text').size()).toBe(2);
            let line = svgNode.select('line');
            expect(line.attr('x1')).toBe('0');
            expect(line.attr('x2')).toBe('20');
            let circle = svgNode.select('circle');
            expect(circle.attr('class')).toBe('some-other-class');
        });
    });

    describe('createLegendMarkers', () => {

        it('should return markers for display', () => {
            let result = createLegendMarkers({
                dataItems: ['current', 'medianStatistics'],
                metadata: {
                    statistics: {
                        beginYear: 2010,
                        endYear: 2012
                    }
                }
            });
            expect(result).toEqual([
                {
                    type: lineMarker,
                    domId: 'ts-legend-current',
                    domClass: 'line',
                    text: 'Current Year',
                    groupId: 'current-line-marker'
                },
                {
                    type: rectangleMarker,
                    domId: null,
                    domClass: 'mask',
                    text: 'Current Timeseries Mask',
                    groupId: null,
                    fill: 'url(#hash-45)'
                },
                {
                    type: circleMarker,
                    r: 4,
                    domId: null,
                    domClass: 'median-data-series',
                    groupId: 'median-circle-marker',
                    text: 'Median 2010 - 2012',
                    fill: null
                }
            ]);
        });

        it('should line segment markers for display', () => {
            let result = createLegendMarkers({
                dataItems: ['current', 'medianStatistics'],
                metadata: {
                    statistics: {
                        beginYear: 2010,
                        endYear: 2012
                    }
                }
            }, [
                {
                    classes: {approved: false, estimated: false, dataMask: 'ice'},
                    points: []
                },
                {
                    classes: {approved: false, estimated: false, dataMask: 'eqp'},
                    points: []
                }
            ]);
            expect(result).toEqual([
                {
                    type: lineMarker,
                    domId: 'ts-legend-current',
                    domClass: 'line',
                    text: 'Current Year',
                    groupId: 'current-line-marker'
                },
                {
                    type: rectangleMarker,
                    domId: null,
                    domClass: 'mask',
                    text: 'Current Timeseries Mask',
                    groupId: null,
                    fill: 'url(#hash-45)'
                },
                {
                    type: circleMarker,
                    r: 4,
                    domId: null,
                    domClass: 'median-data-series',
                    groupId: 'median-circle-marker',
                    text: 'Median 2010 - 2012',
                    fill: null
                },
                {
                    type: rectangleMarker,
                    domId: null,
                    domClass: 'mask ice-mask',
                    text: 'Ice',
                    groupId: null,
                    fill: null
                },
                {
                    type: rectangleMarker,
                    domId: null,
                    domClass: 'mask equipment-malfunction-mask',
                    text: 'Equipment Malfunction',
                    groupId: null,
                    fill: null
                }
            ]);
        });

        it('should return an empty array if keys do not match', () => {
            let result = createLegendMarkers({
                dataItems: ['blah1', 'blah2'],
                metadata: {
                    statistics: {
                        beginYear: 2010,
                        endYear: 2012
                    }
                }
            });
            expect(result.length).toEqual(0);
        });

        it('should still work if stat begin and end years are absent', () => {
            let result = createLegendMarkers({
                dataItems: ['medianStatistics'],
                metadata: {
                    statistics: {
                        beginYear: undefined,
                        endYear: undefined
                    }
                }
            });
            expect(result[0].text).toEqual('Median');
        });
    });

    describe('legendDisplaySelector', () => {

        it('should return a marker if a time series is shown', () => {
            let result = legendDisplaySelector({
                tsData: {
                    medianStatistics: {
                        '00060': {
                            medianMetadata: {
                                beginYear: 2010,
                                endYear: 2012
                            }
                        }
                    }
                },
                showSeries: {
                    current: true,
                    compare: false,
                    medianStatistics: true
                },
                currentParameterCode: '00060'
            });
            expect(result).toEqual({
                dataItems: ['current', 'medianStatistics'],
                metadata: {
                    statistics: {
                        beginYear: 2010,
                        endYear: 2012,
                        description: ''
                    }
                }
            });
        });

        it('should not choke if statisticalMetadata years are absent', () => {
            let result = legendDisplaySelector({
                tsData: {
                    medianStatistics: {}
                },
                showSeries: {
                    medianStatistics: true
                }
            });
            expect(result.metadata.statistics).toEqual({
                beginYear: undefined,
                endYear: undefined,
                description: ''
            });
        });
    });

});