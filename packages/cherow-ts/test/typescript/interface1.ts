import { pass } from '../test-utils';
import { Context } from 'cherow';
import * as t from 'assert';
import { parse } from '../../src/parser/parser';

describe('Interface', () => {

  const validSyntax = [
      'interface Comma { x: number, y: number }',
      'interface I { new (x: number): void; }',
      'interface I<T extends object = { x: number }> {}',
      'interface I { [s: string]: number; }',
      'interface I extends X.Y<Z> {}',
      'interface I { x; y: number; z?: number; }',
      'interface I { y: number; z?: number; }',
      'interface I { [Symbol.iterator]: number;  [Symbol.iterator]?: number; }',
      'interface I { catch(): void; }',
      'interface I { public: number; }'
  ];

  for (const arg of validSyntax) {

      it(`${arg}`, () => {
          t.doesNotThrow(() => {
              parse(`${arg}`, undefined, Context.Empty);
          });
      });
  }

  pass('interface I { public: number; }', Context.Empty, {
    source: 'interface I { public: number; }',
    expected: {
        "body": [
          {
            "body": {
              "body": [
                {
                  "computed": false,
                              "key": {
                                "name": "public",
                                "type": "Identifier"
                              },
                 "type": "TSPropertySignature",
                  "typeAnnotation": {
                    "type": "TypeAnnotation",
                    "typeAnnotation": {
                      "type": "TSNumberKeyword",
                    }
                  }
                }
              ],
              "type": "TSInterfaceBody",
            },
            "extends": null,
            "id": {
              "name": "I",
              "type": "Identifier",
              "typeAnnotation": null,
           },
            "type": "TSInterfaceDeclaration",
            "typeParameters": null,
          }
        ],
        "sourceType": "script",
        "type": "Program"
      }
  });

  pass('interface I { catch(): void; }', Context.Empty, {
    source: 'interface I { catch(): void; }',
    expected: {
        "body": [
          {
            "body": {
              "body": [
                {
                 "computed": false,
                 "key": {
                    "name": "catch",
                    "type": "Identifier",
                  },
                  "parameters": [],
                  "readonly": false,
                  "type": "TSMethodSignature",
                  "typeAnnotation": {
                    "type": "TypeAnnotation",
                    "typeAnnotation": {
                      "type": "TSVoidKeyword",
                    }
                  }
                }
              ],
              "type": "TSInterfaceBody",
            },
            "extends": null,
            "id": {
              "name": "I",
              "type": "Identifier",
              "typeAnnotation": null,
            },
            "type": "TSInterfaceDeclaration",
            "typeParameters": null,
          }
        ],
        "sourceType": "script",
        "type": "Program"
      }
  });

  pass('interface I extends X.Y<Z> {}', Context.Empty, {
    source: 'interface I extends X.Y<Z> {}',
    expected: {
        "body": [
          {
            "body": {
              "body": [],
              "type": "TSInterfaceBody",
            },
            "extends": [
              {
                "expression": {
                  "left": {
                   "name": "X",
                    "type": "Identifier",
                    "typeAnnotation": null,
                  },
                  "right": {
                    "name": "Y",
                    "type": "Identifier",
                    "typeAnnotation": null,
                  },
                  "type": "TSQualifiedName",
                },
                "type": "TSExpressionWithTypeArguments",
               "typeParameters": {
                  "params": [
                    {
                      "type": "TSTypeReference",
                      "typeName": {
                        "name": "Z",
                        "type": "Identifier",
                        "typeAnnotation": null,
                      },
                      "typeParameters": [],
                    },
                  ],
                  "type": "TypeParameterInstantiation"
                }
              }
            ],
            "id": {
              "name": "I",
              "type": "Identifier",
              "typeAnnotation": null,
            },
            "type": "TSInterfaceDeclaration",
            "typeParameters": null,
          }
        ],
        "sourceType": "script",
        "type": "Program"
      }
  });

  pass('interface I { new (x: number): void; }', Context.Empty, {
  source: 'interface I { new (x: number): void; }',
  expected: {
      "body": [
        {
          "body": {
           "body": [
              {
                "parameters": [
                  {
                    "name": "x",
                    "optional": false,
                    "type": "Identifier",
                    "typeAnnotation": {
                      "type": "TypeAnnotation",
                      "typeAnnotation": {
                        "type": "TSNumberKeyword",
                      }
                    }
                  }
                ],
                "type": "TSConstructSignatureDeclaration",
                "typeAnnotation": {
                                "type": "TypeAnnotation",
                                "typeAnnotation": {
                                  "type": "TSVoidKeyword"
                                }
                              }
              }
            ],
            "type": "TSInterfaceBody"
          },
          "extends": null,
          "id": {
            "name": "I",
            "type": "Identifier",
            "typeAnnotation": null,
          },
          "type": "TSInterfaceDeclaration",
          "typeParameters": null,
        }
      ],
      "sourceType": "script",
      "type": "Program"
    }
});

pass('interface I { (x: number): void; }', Context.Empty, {
  source: 'interface I { (x: number): void; }',
  expected: {
      "body": [
        {
          "body": {
            "body": [
              {
                "parameters": [
                  {
                    "name": "x",
                    "optional": false,
                    "type": "Identifier",
                    "typeAnnotation": {
                      "type": "TypeAnnotation",
                      "typeAnnotation": {
                        "type": "TSNumberKeyword",
                      }
                   }
                  }
                ],
                "type": "TSConstructSignatureDeclaration",
                "typeAnnotation": {
                  "type": "TypeAnnotation",
                  "typeAnnotation": {
                    "type": "TSVoidKeyword",
                  }
                }
              }
            ],
           "type": "TSInterfaceBody",
          },
          "extends": null,
          "id": {
            "name": "I",
            "type": "Identifier",
            "typeAnnotation": null,
          },
          "type": "TSInterfaceDeclaration",
          "typeParameters": null,
        }
      ],
      "sourceType": "script",
      "type": "Program"
    }
});
/*
pass(`interface Comma { x: number, y: number }
  interface Semi { x: number; y: number }
  interface Newline {
      x: number
      y: number
  }`, Context.Empty, {
    source: `interface Comma { x: number, y: number }
    interface Semi { x: number; y: number }
    interface Newline {
        x: number
        y: number
    }`,
    expected: {
        "body": [
          {
            "body": {
              "body": [
                {
                  "computed": false,
                  "key": {
                    "name": "x",
                    "type": "Identifier",
                    "typeAnnotation": null,
                  },
                  "type": "TSPropertySignature",
                  "typeAnnotation": {
                    "type": "TypeAnnotation",
                    "typeAnnotation": {
                      "type": "TSNumberKeyword"
                    }
                  }
                },
                {
                  "computed": false,
                  "key": {
                    "name": "number",
                    "type": "Identifier",
                    "typeAnnotation": null,
                  },
                  "type": "TSPropertySignature",
                  "typeAnnotation": null,
                },
                {
                  "computed": false,
                  "key": {
                    "name": "y",
                    "type": "Identifier"
                  },
                  "type": "TSPropertySignature",
                  "typeAnnotation": {
                    "type": "TypeAnnotation",
                    "typeAnnotation": {
                      "type": "TSNumberKeyword",
                   }
                  }
               }
              ],
              "type": "TSInterfaceBody",
            },
            "extends": null,
            "id": {
              "name": "Comma",
              "type": "Identifier",
              "typeAnnotation": null,
            },
            "type": "TSInterfaceDeclaration",
            "typeParameters": null,
          },
          {
            "body": {
              "body": [
                {
                  "computed": false,
                  "key": {
                    "name": "x",
                    "type": "Identifier"
                  },
                  "type": "TSPropertySignature",
                  "typeAnnotation": {
                    "type": "TypeAnnotation",
                    "typeAnnotation": {
                      "type": "TSNumberKeyword"
                    }
                  }
                },
                {
                  "computed": false,
                  "key": {
                    "name": "y",
                    "type": "Identifier"
                  },
                  "type": "TSPropertySignature",
                  "typeAnnotation": {
                    "type": "TypeAnnotation",
                    "typeAnnotation": {
                      "type": "TSNumberKeyword"
                    }
                  }
                }
              ],
              "type": "TSInterfaceBody",
            },
            "extends": null,
            "id": {
              "name": "Semi",
              "type": "Identifier",
              "typeAnnotation": null,
            },
            "type": "TSInterfaceDeclaration",
            "typeParameters": null,
          },
          {
            "body": {
              "body": [
                {
                  "computed": false,
                  "key": {
                   "name": "x",
                    "type": "Identifier",
                  },
                  "type": "TSPropertySignature",
                  "typeAnnotation": {
                    "type": "TypeAnnotation",
                    "typeAnnotation": {
                      "type": "TSNumberKeyword",
                    },
                  }
                },
                {
                  "computed": false,
                 "key": {
                    "name": "y",
                    "type": "Identifier",
                  },
                  "type": "TSPropertySignature",
                  "typeAnnotation": {
                    "type": "TypeAnnotation",
                    "typeAnnotation": {
                      "type": "TSNumberKeyword",
                    }
                  }
                }
              ],
              "type": "TSInterfaceBody",
            },
            "extends": null,
            "id": {
             "name": "Newline",
              "type": "Identifier",
              "typeAnnotation": null,
            },
            "type": "TSInterfaceDeclaration",
            "typeParameters": null,
          },
        ],
        "sourceType": "script",
        "type": "Program"
      }
});*/

pass('interface I<T extends object = { x: number }> {}', Context.Empty, {
  source: 'interface I<T extends object = { x: number }> {}',
  expected: {
      "body": [
        {
          "body": {
            "body": [],
           "type": "TSInterfaceBody",
          },
         "extends": null,
          "id": {
            "name": "I",
            "type": "Identifier",
            "typeAnnotation": null,
          },
          "type": "TSInterfaceDeclaration",
          "typeParameters": {
            "params": [
              {
                "constraint": {
                  "type": "TSObjectKeyword"
                },
                "default": {
                  "members": [
                    {
                      "computed": false,
                      "key": {
                        "name": "x",
                        "type": "Identifier"
                     },
                      "type": "TSPropertySignature",
                      "typeAnnotation": {
                        "type": "TypeAnnotation",
                        "typeAnnotation": {
                          "type": "TSNumberKeyword"
                       }
                      }
                    }
                  ],
                  "type": "TSTypeLiteral"
                },
                "name": "T",
                "type": "TSTypeParameter"
              }
            ],
            "type": "TSTypeParameterDeclaration"
          }
        }
     ],
      "sourceType": "script",
      "type": "Program",
    }
});
});
