const routes = [
  {
    path: '/',
    component: () => import('src/layouts/EditorLayout.vue'),
    children: [{ path: '', component: () => import('pages/EditorPage.vue') }],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
