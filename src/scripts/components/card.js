const getTemplate = () => {
  return document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);
};

export const createCardElement = (
  cardData,
  { onPreviewPicture, onLikeIcon, onDeleteCard, onInfoClick, currentUserId }
) => {
  const cardElement = getTemplate();
  const likeButton = cardElement.querySelector(".card__like-button");
  const deleteButton = cardElement.querySelector(".card__control-button_type_delete");
  const infoButton = cardElement.querySelector(".card__control-button_type_info");
  const cardImage = cardElement.querySelector(".card__image");
  const cardTitle = cardElement.querySelector(".card__title");
  const likeCountElement = cardElement.querySelector(".card__like-count");

  cardImage.src = cardData.link;
  cardImage.alt = cardData.name;
  cardTitle.textContent = cardData.name;
  
  if (likeCountElement) {
    likeCountElement.textContent = cardData.likes ? cardData.likes.length : 0;
  }
  
  const isLikedByCurrentUser = cardData.likes && cardData.likes.some(user => user._id === currentUserId);
  if (isLikedByCurrentUser) {
    likeButton.classList.add("card__like-button_is-active");
  }
  
  const isOwnCard = cardData.owner && cardData.owner._id === currentUserId;
  if (!isOwnCard && deleteButton) {
    deleteButton.style.display = 'none';
  }

  if (onInfoClick && infoButton) {
    infoButton.addEventListener("click", () => {
      onInfoClick(cardData._id);
    });
  }

  if (onLikeIcon) {
    likeButton.addEventListener("click", () => {
      onLikeIcon(likeButton, cardData._id, isLikedByCurrentUser, likeCountElement);
    });
  }

  if (onDeleteCard && deleteButton) {
    deleteButton.addEventListener("click", () => {
      onDeleteCard(cardElement, cardData._id);
    });
  }

  if (onPreviewPicture) {
    cardImage.addEventListener("click", () => {
      onPreviewPicture({
        name: cardData.name,
        link: cardData.link
      });
    });
  }

  return cardElement;
};