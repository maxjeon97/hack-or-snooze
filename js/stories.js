"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);
  const hostName = story.getHostName();
  const starHtml = generateStarHtml(story, currentUser);
  const trashHtml = generateTrashHtml(story, currentUser);
  return $(`
      <li data-id="${story.storyId}">
        <span class="star">
          ${starHtml}
        </span>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <span class="trash">
          ${trashHtml}
        </span>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Generates starHTML given a story and the currentUser */

function generateStarHtml(story, user) {
  if (user) {
    return user.isFavoritedByUser(story)
      ? '<i class="bi bi-star-fill"></i>'
      : '<i class="bi bi-star"></i>';
  }

  // if no user is logged in, html should be empty
  return "";
}

/**When a star icon is clicked, toggle star display based on its favorite
 * status. Also, remove and add the stories to the user's list of favorites
 * accordingly
 */

async function handleStarClick(evt) {
  const $evtTarget = $(evt.target);
  const storyId = $evtTarget.closest("li").data("id");
  const story = await Story.getStoryById(storyId);

  if ($evtTarget.hasClass("bi-star-fill")) {
    await currentUser.removeFavorite(story);
    $evtTarget.toggleClass("bi-star-fill bi-star");
  }
  else {
    await currentUser.addFavorite(story);
    $evtTarget.toggleClass("bi-star-fill bi-star");
  }
}

$(".stories-container").on("click", ".star", handleStarClick);

/** Given a story and a user, add trash icon to any story that is submitted
 * by that user
 */

function generateTrashHtml(story, user) {
  if (user) {
    if (user.isOwnedByUser(story)) {
      return '<i class="bi bi-trash"></i>';
    }
    // return nothing if story is not inside user's own stories
    return "";
  }
}


/** When a trash icon is clicked, delete the story from the API, and remove
 * it from the DOM
 */

async function handleTrashClick(evt) {
  const $evtTarget = $(evt.target);
  const storyId = $evtTarget.closest("li").data("id");
  await Story.deleteStory(storyId);
  $evtTarget.closest("li").remove();
  storyList.stories = storyList.stories.filter(s => s.storyId !== storyId);
}

$(".stories-container").on("click", ".trash", handleTrashClick);


/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");
  $favoritesList.hide();
  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

/** Empties favorites list, iterates through the user's list of favorites,
 * generates story HTML for each story, and attaches favorited story to the
 * favorites list. Reveals the previously hidden favorites list
 */

function putFavoritesOnPage() {
  $favoritesList.empty();

  const favorites = currentUser.favorites;
  for (let story of favorites) {
    const $story = generateStoryMarkup(story);
    $favoritesList.prepend($story);
  }
  $favoritesList.show();
}

/** Empties my stories list, iterates through the user's list of my stories,
 * generates story HTML for each story, and attaches user's story to the
 * my stories list. Reveals the previously hidden my stories list
 */

function putMyStoriesOnPage() {
  $myStoriesList.empty();

  const myStories = currentUser.ownStories;
  for (let story of myStories) {
    const $story = generateStoryMarkup(story);
    $myStoriesList.append($story);
  }
  $myStoriesList.show();
}







/** Gets the story data from the form and then adds it to the list of
 * stories. Then repopulates all the stories on the page and hides the form.
 */

async function getStoryDataAndDisplay(evt) {
  evt.preventDefault();
  const storyData = {
    title: $("#title").val(),
    author: $("#author").val(),
    url: $("#url").val()
  };
  const newStory = await storyList.addStory(currentUser, storyData);
  const $story = generateStoryMarkup(newStory);
  $allStoriesList.prepend($story);
  $storyForm.trigger("reset");
  $storyForm.hide();
}

$("#story-form").on("submit", getStoryDataAndDisplay);





