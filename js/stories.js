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
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Generates starHTML given a story and the currentUser */

function generateStarHtml(story, user) {
  if (user) {
    return user.isFavorite(story)
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

$(".stories-list").on("click", ".star", handleStarClick);


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





