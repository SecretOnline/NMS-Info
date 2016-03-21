# NMS Information Repository
[Visit the Repository](http://secretonline.github.io/NMS-Info)

This is intended to be a repository for any No Man's Sky related information.

This is an open source project (duh, it's on GitHub). Feel free to contribute.

There is a WIP wiki for this project, explaining some features of the repo.

## How to contribute
1. Fork this repo
2. (Optional, but reccomended) Create a branch. Give it a descriptive name, if you like
  * This prevents _most_ merge conflicts (but not all)
3. Make your changes
4. Push your changes
5. Create a [pull request](https://github.com/SecretOnline/NMS-Info/compare)
6. Wait for it to be merged
7. Congratulations, you just contributed!

## Adding into to the repository

If you're adding information to the repo, use the [generator](http://secretonline.github.io/NMS-Info/generator.html) to ensure proper formatting.

In previous versions it was important that you added to the end of the file. Now it is no longer as important. In order to keep things consistent, I ask that you still add to the end of the file.

The [info dump](http://secretonline.github.io/NMS-Info/infodump.html) can be used to quickly dump all of the information, which can help with grammar and spelling checking.

Changes to the information cards can be documented in `data/recent.json`. More on the format below.

### Contributors

Thanks to these people in addition to those who have committed straight to GitHub.

[/u/Ockvil](https://reddit.com/u/Ockvil)
[/u/teaminus](https://reddit.com/u/teaminus)
[/u/Akatsukaii](https://reddit.com/u/Akatsukaii)
[/u/benstor214](https://reddit.com/u/benstor214)
[/u/Perfecteuphoria2](https://reddit.com/u/Perfecteuphoria2)
[/u/OprahOfOverheals](https://reddit.com/u/OprahOfOverheals)

## Data formats

You don't really need to worry about this, but it's here for documentation purposes. Arrays can hold no elements unless otherwise stated. If an array holds elements of different types, then either is acceptable.

**info.json**

``` JSON
[
  {
    "title": "String. Title of this piece of information",
    "text": [
      "String. A paragraph to be put inside the expanded card"
    ],
    "categories": [
      "String. Title of a category. The first entry determines a card's header background and text color"
    ],
    "sources": [
      "String. URL of a source"
    ],
    "related": [
      "String. Title of a related card"
    ]
  }
]
```

**categories.json**

``` JSON
[
  {
    "title": "String. Title of this category",
    "color": "String. Valid CSS color",
    "darkText": "Boolean. Black text if true, otherwise white"
  }
]
```

**resources.json**

``` JSON
[
  {
    "name": "String. Name of this element",
    "symbol": "String. Generally two characters. Chemical symbol for this element",
    "description": "String. Description as given in the game",
    "color": "String. Valid CSS color",
    "makes": [
      "String. Name of item this element is a component of. If it is another element, then this will link to that element"
    ],
    "madeFrom": "Array. Does not need to be defined, as it is created when the page loads"
  }
]
```

**recent.json**

``` JSON
[
  "String. Marks entire card as being added",
  {
    "title": "String. Title of piece of information that has been edited",
    "additions": [
      "Integer. Index (starting at 0) of piece of information that was added"
    ],
    "edited": [
      "Integer. Index (starting at 0) of piece of information that was edited"
    ],
    "removals": [
      "Integer. Index (starting at 0) of piece of information to insert a removal notice before"
    ]
  }
]
```

**links.json**

``` JSON
[
  {
    "title": "String. Title of link",
    "method": "String. One of 'link', 'embed', or 'yt'. Determines click behaviour",
    "src": "String. URL of link. Video ID if 'method' is 'yt'",
    "color": "String. Valid CSS Color",
    "darkText": "Boolean. Black text if true, otherwise white"
  }
]
```
