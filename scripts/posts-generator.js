'use strict';

const pagination = require('hexo-pagination');

hexo.extend.generator.register('posts_page', function(locals) {
  const posts = locals.posts.toArray().sort((a, b) => {
    const aTop = Boolean(a.top);
    const bTop = Boolean(b.top);

    if (aTop !== bTop) {
      return aTop ? -1 : 1;
    }

    return b.date.valueOf() - a.date.valueOf();
  });
  const perPage = this.config.per_page || 10;

  return pagination('posts', posts, {
    perPage,
    layout: ['post'],
    data: {
      title: 'Posts',
      type: 'posts'
    }
  });
});
