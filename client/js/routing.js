import Router from 'baobab-router';

export default function bindRoutes(tree) {
  return new Router(tree, {
    defaultRoute: '/home',
    routes: [
      {
        path: '/home',
        state: {
          view: 'home',
          viewGroup: 'staticPages'
        }
      },
      {
        path: '/about',
        state: {
          view: 'about',
          viewGroup: 'staticPages'
        }
      },
      {
        path: '/legal',
        state: {
          view: 'legal',
          viewGroup: 'staticPages'
        }
      },
      {
        path: '/classification',
        defaultRoute: '/browser',
        state: {viewGroup: 'classification'},
        routes: [
          {
            path: '/browser',
            state: {view: 'classification'}
          }
        ]
      },
      {
        path: '/exploration',
        defaultRoute: '/meta',
        state: {viewGroup: 'exploration'},
        routes: [
          {
            path: '/meta',
            query: {
              model: ':dataModel',
              dataType: ':dataType',
              productClassification: ':productClassification',
              countryClassification: ':countryClassification',
              products: {match: ':product', cast: 'json'},
              countries: {match: ':country', cast: 'json'},
              direction: ':direction',
              kind: ':kind',
              sourceType: ':sourceType',
            },
            state: {
              view: 'explorationMeta',
              metadataState: {
                dataModel: ':dataModel',
                dataType: ':dataType',
                selectors: {
                  productClassification: ':productClassification',
                  countryClassification: ':countryClassification',
                  product: ':product',
                  country: ':country',
                  direction: ':direction',
                  kind: ':kind',
                  sourceType: ':sourceType'
                }
              }
            }
          },
          {
            path: '/indicators',
            state: {view: 'explorationIndicators'}
          },
          {
            path: '/network',
            state: {view: 'explorationNetwork'}
          },
          {
            path: '/terms',
            state: {view: 'explorationTerms'}
          },
          {
            path: '/sources',
            state: {view: 'explorationSources'}
          }
        ]
      },
      {
        path: '/glossary',
        defaultRoute: '/products',
        state: {viewGroup: 'glossary'},
        routes: [
          {
            path: '/products',
            state: {view: 'glossaryPanel'}
          },
          {
            path: '/concepts',
            state: {view: 'concepts'}
          }
        ]
      }
    ]
  });
}
