'use strict';

const md = require('markdown-it')({
  html: true,
}).use(require('@renbaoshuo/markdown-it-katex'));

function renderFootnotes(text) {
  const footnotes = [];
  const reFootnoteContent = /\[\^(\d+)\]: ?([\S\s]+?)(?=\[\^(?:\d+)\]|\n\n|$)/g;
  const reInlineFootnote = /\[\^(\d+)\]\((.+?)\)/g;
  const reFootnoteIndex = /\[\^(\d+)\]/g;
  let html = '';

  text = text.replace(reInlineFootnote, function(match, index, content) {
    footnotes.push({
      index: index,
      content: content,
    });
    return '[^' + index + ']';
  });

  text = text.replace(reFootnoteContent, function(match, index, content) {
    footnotes.push({
      index: index,
      content: content,
    });
    return '';
  });

  text = text.replace(
    reFootnoteIndex,
    '<sup id="fnref:$1"><a href="#fn:$1" style="border-bottom:none;" rel="footnote">$1</a></sup>'
  );

  footnotes.sort(function(a, b) {
    return a.index - b.index;
  });

  footnotes.forEach(function(footnote) {
    html += '<li id="fn:' + footnote.index + '">';
    html += '<span style="padding-right: 10px;">';
    html += footnote.index;
    html += '.</span>';
    html += '<span>';
    html += md.renderInline(footnote.content.trim());
    html += '</span>';
    html += '<a style="font-family:arial; border-bottom:none;" href="#fnref:' + footnote.index + '" rev="footnote"> ↩</a>';
    html += '</li>';
  });

  if (footnotes.length) {
    text += '<div id="footnotes">';
    text += '<hr>';
    text += '<div id="footnotelist">';
    text += '<ol style="list-style:none; padding-left: 0;">' + html + '</ol>';
    text += '</div></div>';
  }

  return text;
}

hexo.extend.filter.register('before_post_render', function(data) {
  data.content = renderFootnotes(data.content);
  return data;
});
