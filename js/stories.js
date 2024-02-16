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
  const emptyStar = '<i class="bi bi-star"></i>';
  const filledStar = '<i class="bi bi-star-fill"></i>';
  const hmtlStar = currentUser.isFavorite(story) ? filledStar : emptyStar;
  const hostName = story.getHostName();
  return $(`
      <li data-id="${story.storyId}">
        <span class="star">
          ${hmtlStar}
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

/**When a star icon is clicked, toggle star display based on its favorite
 * status. Also, remove and add the stories to the user's list of favorites
 * accordingly
 */

async function handleStarClick(evt) {
  const $evtTarget = $(evt.target);
  const storyId = $evtTarget.closest("li").data("id");
  const story = await Story.getStoryById(storyId);
  //TODO: refactored

  if (currentUser.isFavorite(story)) {
    $evtTarget.removeClass("bi-star-fill");
    $evtTarget.addClass("bi-star");
    await currentUser.removeFavorite(story);
  }
  else {
    $evtTarget.removeClass("bi-star");
    $evtTarget.addClass("bi-star-fill");
    await currentUser.addFavorite(story);
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





