'use strict';

function addImageAttribute(tag, name, value) {
  const attrPattern = new RegExp('\\s' + name + '\\s*=', 'i');
  if (attrPattern.test(tag)) {
    return tag;
  }

  return tag.replace(/\/?>$/, function (end) {
    return ' ' + name + '="' + value + '"' + end;
  });
}

hexo.extend.filter.register('after_post_render', function (data) {
  if (!data.content || data.layout !== 'post') {
    return data;
  }

  data.content = data.content.replace(/<img\b[^>]*>/gi, function (tag) {
    if (/\sno-lazy(?:\s|=|>|\/)/i.test(tag)) {
      return tag;
    }

    let nextTag = addImageAttribute(tag, 'loading', 'lazy');
    nextTag = addImageAttribute(nextTag, 'decoding', 'async');
    return nextTag;
  });

  return data;
});
