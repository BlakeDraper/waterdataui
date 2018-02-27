const { collectionsSelector, lineSegmentsSelector, pointsSelector, requestSelector,
    currentTimeSeriesSelector } = require('./timeseries');


const TEST_DATA = {
    series: {
        timeSeries: {
            '00060': {
                points: [{
                    value: 10,
                    qualifiers: ['P'],
                    approved: false,
                    estimated: false
                }, {
                    value: null,
                    qualifiers: ['P', 'ICE'],
                    approved: false,
                    estimated: false
                }, {
                    value: null,
                    qualifiers: ['P', 'FLD'],
                    approved: false,
                    estimated: false
                }]
            }
        },
        timeSeriesCollections: {
            'coll1': {
                variable: 45807197,
                timeSeries: ['00060']
            }
        },
        requests: {
            current: {
                timeSeriesCollections: ['coll1']
            }
        },
        variables: {
            '45807197': {
                variableCode: '00060',
                oid: 45807197
            }
        }
    },
    currentVariableID: '45807197'
};


describe('Timeseries module', () => {
    describe('line segment selector', () => {
        it('should separate on approved', () => {
            expect(lineSegmentsSelector('current')({
                ...TEST_DATA,
                series: {
                    ...TEST_DATA.series,
                    timeSeries: {
                        ...TEST_DATA.series.timeSeries,
                        '00060': {
                            points: [{
                                value: 10,
                                qualifiers: ['P'],
                                approved: false,
                                estimated: false
                            }, {
                                value: 10,
                                qualifiers: ['P'],
                                approved: true,
                                estimated: false
                            }, {
                                value: 10,
                                qualifiers: ['P'],
                                approved: true,
                                estimated: false
                            }]
                        }
                    }
                }
            })).toEqual([{
                classes: {
                    approved: false,
                    estimated: false,
                    dataMask: null
                },
                points: [{
                    value: 10,
                    qualifiers: ['P'],
                    approved: false,
                    estimated: false
                }]
            }, {
                classes: {
                    approved: true,
                    estimated: false,
                    dataMask: null
                },
                points: [{
                    value: 10,
                    qualifiers: ['P'],
                    approved: true,
                    estimated: false
                }, {
                    value: 10,
                    qualifiers: ['P'],
                    approved: true,
                    estimated: false
                }]
            }]);
        });

        it('should separate on estimated', () => {
            expect(lineSegmentsSelector('current')({
                ...TEST_DATA,
                series: {
                    ...TEST_DATA.series,
                    timeSeries: {
                        ...TEST_DATA.series.timeSeries,
                        '00060': {
                            points: [{
                                value: 10,
                                qualifiers: ['P'],
                                approved: false,
                                estimated: false
                            }, {
                                value: 10,
                                qualifiers: ['P'],
                                approved: false,
                                estimated: true
                            }, {
                                value: 10,
                                qualifiers: ['P'],
                                approved: false,
                                estimated: true
                            }]
                        }
                    }
                }
            })).toEqual([{
                classes: {
                    approved: false,
                    estimated: false,
                    dataMask: null
                },
                points: [{
                    value: 10,
                    qualifiers: ['P'],
                    approved: false,
                    estimated: false
                }]
            }, {
                classes: {
                    approved: false,
                    estimated: true,
                    dataMask: null
                },
                points: [{
                    value: 10,
                    qualifiers: ['P'],
                    approved: false,
                    estimated: true
                }, {
                    value: 10,
                    qualifiers: ['P'],
                    approved: false,
                    estimated: true
                }]
            }]);
        });

        it('should separate out masked values', () => {
            expect(lineSegmentsSelector('current')({
                ...TEST_DATA,
                series: {
                    ...TEST_DATA.series,
                    timeSeries: {
                        ...TEST_DATA.series.timeSeries,
                        '00060': {
                            points: [{
                                value: 10,
                                qualifiers: ['P'],
                                approved: false,
                                estimated: false
                            }, {
                                value: null,
                                qualifiers: ['P', 'ICE'],
                                approved: false,
                                estimated: false
                            }, {
                                value: null,
                                qualifiers: ['P', 'FLD'],
                                approved: false,
                                estimated: false
                            }]
                        }
                    }
                }
            })).toEqual([
                {
                    classes: {
                        approved: false,
                        estimated: false,
                        dataMask: null
                    },
                    points: [{
                        value: 10,
                        qualifiers: ['P'],
                        approved: false,
                        estimated: false
                    }]
                },
                {
                    classes: {
                        approved: false,
                        estimated: false,
                        dataMask: 'ice'
                    },
                    points: [{
                        value: null,
                        qualifiers: ['P', 'ICE'],
                        approved: false,
                        estimated: false
                    }]
                },
                {
                    classes: {
                        approved: false,
                        estimated: false,
                        dataMask: 'fld'
                    },
                    points: [{
                        value: null,
                        qualifiers: ['P', 'FLD'],
                        approved: false,
                        estimated: false
                    }]
                }
            ]);
        });
    });

    describe('collectionsSelector', () => {
        it('works', () => {
            expect(collectionsSelector('current')({
                series: {
                    requests: {
                        current: {
                            timeSeriesCollections: ['coll1', 'coll2']
                        }
                    },
                    timeSeriesCollections: {
                        'coll1': 1,
                        'coll2': 2
                    }
                }
            })).toEqual([1, 2]);
        });
    });

    describe('currentTimeSeriesSelector', () => {
        it('works', () => {
            expect(currentTimeSeriesSelector('current')({
                series: {
                    requests: {
                        current: {
                            timeSeriesCollections: ['coll1', 'coll2']
                        }
                    },
                    timeSeriesCollections: {
                        'coll1': {
                            timeSeries: ['one', 'two'],
                            variable: 45807197
                        },
                        'coll2': {
                            timeSeries: ['three', 'four'],
                            variable: 45807197
                        },
                        'coll3': {
                            timeSeries: ['five', 'six'],
                            variable: 'do not match'
                        }
                    },
                    timeSeries: {
                        one: {
                            item: 'one'
                        },
                        two: {
                            item: 'two'
                        },
                        three: {
                            item: 'three'
                        },
                        four: {
                            item: 'four'
                        },
                        five: {
                            item: 'five'
                        },
                        six: {
                            item: 'six'
                        }
                    },
                    variables: {
                        '45807197': {
                            oid: 45807197,
                            variableCode: {
                                value: '00060',
                                variableID: 45807197
                            }
                        }
                    }
                },
                currentVariableID: '45807197'
            })).toEqual([
                {item: 'one'},
                {item: 'two'},
                {item: 'three'},
                {item: 'four'}
            ]);
        });
    });

    describe('requestSelector', () => {
        it('works', () => {
            expect(requestSelector('current')({
                series: {
                    requests: {
                        current: 'current request object'
                    }
                }
            })).toEqual('current request object');
            expect(requestSelector('current')({series: {}})).toEqual(null);
            expect(requestSelector('notCurrent')({
                series: {
                    requests: {
                        current: 'current request object'
                    }
                }
            })).toEqual(null);
        });
    });

    describe('pointsSelector', () => {
        it('works with a single collection and one time series', () => {
            expect(pointsSelector('current')({
                series: {
                    requests: {
                        current: {
                            timeSeriesCollections: ['coll1']
                        }
                    },
                    timeSeriesCollections: {
                        'coll1': {
                            variable: 45807197,
                            timeSeries: ['one']
                        }
                    },
                    timeSeries: {
                        one: {
                            points: ['ptOne', 'ptTwo', 'ptThree']
                        }
                    },
                    variables: {
                        '45807197': {
                            variableCode: '00060',
                            oid: 45807197
                        }
                    }
                },
                currentVariableID: '45807197'
            })).toEqual(['ptOne', 'ptTwo', 'ptThree']);
        });
    });
});
