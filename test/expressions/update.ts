import { pass } from '../test-utils';

describe('Expressions - Update', () => {

        pass(`eval--`, {
            source: 'eval--',
            loc: true,
            ranges: true,
            raw: true,
            expected: {
                type: 'Program',
                body: [
                    {
                        type: 'ExpressionStatement',
                        expression: {
                            type: 'UpdateExpression',
                            argument: {
                                type: 'Identifier',
                                name: 'eval',
                                start: 0,
                                end: 4,
                                loc: {
                                    start: {
                                        line: 1,
                                        column: 0
                                    },
                                    end: {
                                        line: 1,
                                        column: 4
                                    }
                                }
                            },
                            operator: '--',
                            prefix: false,
                            start: 0,
                            end: 6,
                            loc: {
                                start: {
                                    line: 1,
                                    column: 0
                                },
                                end: {
                                    line: 1,
                                    column: 6
                                }
                            }
                        },
                        start: 0,
                        end: 6,
                        loc: {
                            start: {
                                line: 1,
                                column: 0
                            },
                            end: {
                                line: 1,
                                column: 6
                            }
                        }
                    }
                ],
                sourceType: 'script',
                start: 0,
                end: 6,
                loc: {
                    start: {
                        line: 1,
                        column: 0
                    },
                    end: {
                        line: 1,
                        column: 6
                    }
                }
            }
        });

        pass(`++a`, {
            source: '++a',
            loc: true,
            ranges: true,
            raw: true,
            expected: {
                type: 'Program',
                body: [
                    {
                        type: 'ExpressionStatement',
                        expression: {
                            type: 'UpdateExpression',
                            operator: '++',
                            prefix: true,
                            argument: {
                                type: 'Identifier',
                                name: 'a',
                                start: 2,
                                end: 3,
                                loc: {
                                    start: {
                                        line: 1,
                                        column: 2
                                    },
                                    end: {
                                        line: 1,
                                        column: 3
                                    }
                                }
                            },
                            start: 0,
                            end: 3,
                            loc: {
                                start: {
                                    line: 1,
                                    column: 0
                                },
                                end: {
                                    line: 1,
                                    column: 3
                                }
                            }
                        },
                        start: 0,
                        end: 3,
                        loc: {
                            start: {
                                line: 1,
                                column: 0
                            },
                            end: {
                                line: 1,
                                column: 3
                            }
                        }
                    }
                ],
                sourceType: 'script',
                start: 0,
                end: 3,
                loc: {
                    start: {
                        line: 1,
                        column: 0
                    },
                    end: {
                        line: 1,
                        column: 3
                    }
                }
            }
        });

        pass(`++arguments`, {
            source: '++arguments',
            loc: true,
            ranges: true,
            raw: true,
            expected: {
                type: 'Program',
                start: 0,
                end: 11,
                loc: {
                  start: {
                    line: 1,
                    column: 0
                  },
                  end: {
                    line: 1,
                    column: 11
                  }
                },
                body: [
                  {
                    type: 'ExpressionStatement',
                    start: 0,
                    end: 11,
                    loc: {
                      start: {
                        line: 1,
                        column: 0
                      },
                      end: {
                        line: 1,
                        column: 11
                      }
                    },
                    expression: {
                      type: 'UpdateExpression',
                      start: 0,
                      end: 11,
                      loc: {
                        start: {
                          line: 1,
                          column: 0
                        },
                        end: {
                          line: 1,
                          column: 11
                        }
                      },
                      operator: '++',
                      prefix: true,
                      argument: {
                        type: 'Identifier',
                        start: 2,
                        end: 11,
                        loc: {
                          start: {
                            line: 1,
                            column: 2
                          },
                          end: {
                            line: 1,
                            column: 11
                          }
                        },
                        name: 'arguments'
                      }
                    }
                  }
                ],
                sourceType: 'script'
              }
        });
});