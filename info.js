(function(win, doc) {
  'use strict';

  function httpGet(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.addEventListener('load', function() {
      callback(xhr.responseText);
    });
    xhr.open('get', url, true);
    xhr.send();
  }

  var tabs = doc.querySelector('paper-tabs');
  var pages = doc.querySelector('iron-pages');

  tabs.addEventListener('iron-select', function() {
    pages.selected = tabs.selected;
  });
  tabs.select(0);

  httpGet('data/info.json', function(response) {
    var cardList = doc.querySelector('.info-list');
    var data = JSON.parse(response);

    data.forEach(function(item) {
      var card = doc.createElement('info-card');
      card.heading = item.title;

      card.addEventListener('click', function() {
        card.classList.toggle('expanded');
      });

      var content = doc.createElement('div');
      content.classList.add('card-content');
      item.text.forEach(function(text) {
        var t = doc.createElement('p');
        t.textContent = text;
        content.appendChild(t);
      });
      card.appendChild(content);

      cardList.appendChild(card);
    });
  });

})(window, document);
