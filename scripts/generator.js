(function() {
  'use strict';

  var categories = {};

  function generateJson() {
    var obj = {};
    var i;

    obj.title = document.querySelector('input.title').value;

    var arr = document.querySelectorAll('.text input');
    for (i = 0; i < arr.length; i++) {
      if (!obj.text)
        obj.text = [];
      obj.text[i] = arr[i].value;
    }

    arr = document.querySelectorAll('.sources input');
    for (i = 0; i < arr.length; i++) {
      if (!obj.sources)
        obj.sources = [];
      obj.sources[i] = arr[i].value;
    }

    arr = document.querySelectorAll('.categories input');
    for (i = 0; i < arr.length; i++) {
      if (!obj.categories)
        obj.categories = [];
      obj.categories[i] = arr[i].value;
    }

    arr = document.querySelectorAll('.related input');
    for (i = 0; i < arr.length; i++) {
      if (!obj.related)
        obj.related = [];
      obj.related[i] = arr[i].value;
    }

    arr = document.querySelectorAll('.keywords input');
    for (i = 0; i < arr.length; i++) {
      if (!obj.keywords)
        obj.keywords = [];
      obj.keywords[i] = arr[i].value;
    }

    if (document.querySelector('.spoiler').checked)
      obj.spoiler = true;

    document.querySelector('.output').value = JSON.stringify(obj);
    createPreview(obj);
  }

  /**
   * Parses text in the output and puts it in the editing area
   */
  function parseJson() {
    var arr = document.querySelectorAll('.inputContainer');
    for (var i = 0; i < arr.length; i++) {
      arr[i].innerHTML = '';
      addAddButton(arr[i]);
    }

    var obj = JSON.parse(document.querySelector('.output').value);

    if (obj.title) {
      document.querySelector('input.title').value = obj.title;
    }
    if (obj.text) {
      obj.text.forEach(function(item) {
        addInput(document.querySelector('.text')).querySelector('input').value = item;
      });
    }
    if (obj.sources) {
      obj.sources.forEach(function(item) {
        addInput(document.querySelector('.sources')).querySelector('input').value = item;
      });
    }
    if (obj.categories) {
      obj.categories.forEach(function(item) {
        addInput(document.querySelector('.categories')).querySelector('input').value = item;
      });
    }
    if (obj.related) {
      obj.related.forEach(function(item) {
        addInput(document.querySelector('.related')).querySelector('input').value = item;
      });
    }
    if (obj.keywords) {
      obj.keywords.forEach(function(item) {
        addInput(document.querySelector('.keywords')).querySelector('input').value = item;
      });
    }
    if (obj.spoiler) {
      document.querySelector('.spoiler').checked = true;
    }
  }

  function addInput(parent) {
    var newEl = document.createElement('div');
    newEl.classList.add('input');
    var input = document.createElement('input');
    input.type = 'text';
    if (parent.classList.contains('categories')) {
      input.setAttribute('list', 'categories');
    } else if (parent.classList.contains('related')) {
      input.setAttribute('list', 'info');
    }
    newEl.appendChild(input);
    addRemoveButton(newEl);
    parent.appendChild(newEl);
    return newEl;
  }

  function addAddButton(parent) {
    var button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'Add';
    button.classList.add('add');
    button.addEventListener('click', function() {
      addInput(this.parentNode);
    });
    parent.appendChild(button);
    return button;
  }

  function addRemoveButton(parent) {
    var button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'Remove';
    button.classList.add('remove');
    button.addEventListener('click', function() {
      this.parentNode.parentNode.removeChild(this.parentNode);
    });
    parent.appendChild(button);
    return button;
  }

  function createPreview(data) {
    var cont = document.querySelector('.preview-container');
    cont.innerHTML = '';

    // Create card element
    var card = document.createElement('div');
    card.classList.add('card');
    card.classList.add('info-card');
    card.classList.add('expanded');
    // Store data values
    card.dataset.title = data.title;

    if (data.spoiler)
      card.classList.add('spoiler');

    // Create header
    var header = document.createElement('div');
    header.classList.add('header');
    var headerBg = document.createElement('div');
    headerBg.classList.add('header-bg');
    var headerTitle = document.createElement('h3');
    headerTitle.classList.add('card-title');
    headerTitle.textContent = data.title;
    header.appendChild(headerBg);
    header.appendChild(headerTitle);
    card.appendChild(header);

    header.addEventListener('click', function() {
      card.classList.toggle('expanded');
    });

    // Add empty content box
    var content = document.createElement('div');
    content.classList.add('card-content');
    card.appendChild(content);

    // Add category list
    if (data.categories)
      if (data.categories.length) {
        try {
          var category = categories[data.categories[0]];
          if (category.darkText) {
            card.classList.add('dark-text');
          }
          headerBg.style.backgroundColor = category.color;
        } catch (err) {
          console.warn('Category ' + data.categories[0] + ' might not exist. Couldn\'t set header properties');
        }

        var cats = document.createElement('div');
        cats.classList.add('categories');

        // Add all specified categories to a list
        var catList = document.createElement('ul');
        data.categories.forEach(function(cat) {
          try {
            var catEl = document.createElement('li');
            catEl.textContent = categories[cat].title;
            catEl.dataset.id = cat;
            catEl.style.color = category.textColor;

            catList.appendChild(catEl);
          } catch (err) {
            console.warn('Countn\'n add category ' + cat + ', ignoring');
          }
        });
        cats.appendChild(catList);

        header.appendChild(cats);
      }

      // Add information text
    var information = document.createElement('div');
    information.classList.add('information');
    if (data.text)
      data.text.forEach(function(text) {
        var t = document.createElement('p');
        t.textContent = text;
        information.appendChild(t);
      });
    content.appendChild(information);

    // If another section is required
    if (data.sources || data.related) {
      var separator = document.createElement('div');
      separator.classList.add('separator');
      content.appendChild(separator);

      // If there are sources to show
      if (data.sources)
        if (data.sources.length) {
          var sources = document.createElement('div');
          sources.classList.add('sources');
          var sourceTitle = document.createElement('h4');
          sourceTitle.textContent = 'Sources';
          sources.appendChild(sourceTitle);

          // Add sources to list
          var sourceList = document.createElement('ul');
          data.sources.forEach(function(source, sIndex) {
            var sourceEl = document.createElement('li');
            var anchor = document.createElement('a');
            anchor.href = source;
            anchor.target = '_blank';
            anchor.textContent = truncateString(source, 10);
            appendHoverElement(anchor, [source]);
            sourceEl.appendChild(anchor);
            sourceList.appendChild(sourceEl);
          });
          sources.appendChild(sourceList);

          content.appendChild(sources);
        }

        // If there are related items to link to
        // Unfinished, do not use at this stage
      if (data.related)
        if (data.related.length) {
          var related = document.createElement('div');
          related.classList.add('related');
          var relatedTitle = document.createElement('h4');
          relatedTitle.textContent = 'Related';
          related.appendChild(relatedTitle);

          // Add related items to list
          var relatedList = document.createElement('ul');
          data.related.forEach(function(rItem) {
            var itemEl = document.createElement('li');
            itemEl.textContent = rItem;
            relatedList.appendChild(itemEl);
          });
          related.appendChild(relatedList);

          content.appendChild(related);
        }
    }

    cont.appendChild(card);
  }

  /**
   * Truncates a string if its length is greater than the maximum, otherwise returns the string
   * @param string String to Truncates
   * @param maxLength Maximum length of output string
   * @return A string of length no more than the given maximum
   */
  function truncateString(string, maxLength) {
    string = string.replace(/^https?:\/\/(?:www\.)?/i, '');

    if (string.length < maxLength)
      return string;
    else
      return string.substr(0, maxLength - 3) + '...';
  }

  /**
   * Creates a Promise that resolves when a file is retrieved
   * @param url URL of file to retrieve
   * @return Promise
   */
  function get(url) {
    return new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.addEventListener('load', function() {
        resolve(xhr.responseText);
      });
      xhr.addEventListener('error', function(e) {
        reject(e);
      });
      xhr.open('get', url, true);
      xhr.send();
    });
  }

  /**
   * Creates a link that has special hover powers
   * @param element Element to add hover box to
   * @param textArray Array of text to place in hover box
   */
  function appendHoverElement(element, textArray) {
    if (textArray.length === 0)
      return;
    // Create elements
    element.classList.add('hoverable');
    var hoverContainer = document.createElement('div');
    hoverContainer.classList.add('hoverable-container');
    element.appendChild(hoverContainer);

    textArray.forEach(function(item) {
      var itemElement = document.createElement('p');
      itemElement.textContent = truncateString(item, 32);
      hoverContainer.appendChild(itemElement);
    });
  }

  window.addEventListener('DOMContentLoaded', function() {
    var arr = document.querySelectorAll('.inputContainer');
    for (var i = 0; i < arr.length; i++)
      addAddButton(arr[i]);
    document.querySelector('button.generate').addEventListener('click', generateJson);
    document.querySelector('button.parse').addEventListener('click', parseJson);

    get('data/categories.json')
      .then(JSON.parse)
      .then(function(cats) {
        var datalist = document.querySelector('#categories');

        cats.forEach(function(item) {
          categories[item.title] = item;

          var opt = document.createElement('option');
          opt.value = item.title;
          datalist.appendChild(opt);
        });
      });

    get('data/info.json')
      .then(JSON.parse)
      .then(function(info) {
        var datalist = document.querySelector('#info');

        info.forEach(function(item) {
          var opt = document.createElement('option');
          opt.value = item.title;
          datalist.appendChild(opt);
        });
      });
  });
}());
