(function() {
  'use strict';

  function generateJson() {
    var obj = {};
    var i;

    obj.title = document.querySelector('.title').value;

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
      document.querySelector('.title').value = obj.title;
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
    newEl.innerHTML = '<input type="text"' + (parent.classList.contains('categories') ? ' list="categories" ' : '') + '>';
    addRemoveButton(newEl);
    parent.appendChild(newEl);
    return newEl;
  }

  function addAddButton(parent) {
    var button = document.createElement('button');
    button.type = 'button';
    button.innerHTML = 'add';
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
    button.innerHTML = 'remove';
    button.classList.add('remove');
    button.addEventListener('click', function() {
      this.parentNode.parentNode.removeChild(this.parentNode);
    });
    parent.appendChild(button);
    return button;
  }
  window.addEventListener('DOMContentLoaded', function() {
    var arr = document.querySelectorAll('.inputContainer');
    for (var i = 0; i < arr.length; i++)
      addAddButton(arr[i]);
    document.querySelector('button.generate').addEventListener('click', generateJson);
    document.querySelector('button.parse').addEventListener('click', parseJson);
  });
}());
