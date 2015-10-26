var tabs = document.querySelector('paper-tabs');
var pages = document.querySelector('iron-pages');

tabs.addEventListener('iron-select', function() {
  pages.selected = tabs.selected;
});
pages.select(0);
