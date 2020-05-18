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
            state: {view: 'explorationMeta'}
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
            state: {view: 'sources'}
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
