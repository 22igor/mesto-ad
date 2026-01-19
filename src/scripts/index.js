import * as api from "./components/api.js";
import { createCardElement } from "./components/card.js";
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from "./components/modal.js";
import { enableValidation, clearValidation } from "./components/validation.js";

// DOM узлы
const placesWrap = document.querySelector(".places__list");
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");

const cardInfoModalWindow = document.querySelector('.popup_type_info');
const cardInfoModalImage = cardInfoModalWindow.querySelector('.popup-info__image');
const cardInfoModalInfoList = cardInfoModalWindow.querySelector('.popup-info__list');
const cardInfoModalUsersList = cardInfoModalWindow.querySelector('.popup-info__users-list');

let currentUserId = null;

const updateButtonText = (button, isLoading, defaultText, loadingText) => {
  button.textContent = isLoading ? loadingText : defaultText;
  button.disabled = isLoading;
};

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const formatDate = (date) => {
  return date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const createInfoString = (term, definition) => {
  const infoTemplate = document.querySelector('#popup-info-definition-template').content;
  const infoElement = infoTemplate.querySelector('.popup-info__definition').cloneNode(true);
  
  infoElement.querySelector('.popup-info__term').textContent = term;
  infoElement.querySelector('.popup-info__definition-text').textContent = definition;
  
  return infoElement;
};

const createUserPreview = (user) => {
  const userTemplate = document.querySelector('#popup-info-user-preview-template').content;
  const userElement = userTemplate.querySelector('.popup-info__user-preview').cloneNode(true);
  
  const avatarElement = userElement.querySelector('.popup-info__user-preview-avatar');
  if (user.avatar) {
    avatarElement.style.backgroundImage = `url(${user.avatar})`;
  }
  
  userElement.querySelector('.popup-info__user-preview-name').textContent = user.name || 'Неизвестно';
  userElement.querySelector('.popup-info__user-preview-about').textContent = user.about || '';
  
  return userElement;
};

const handleInfoClick = (cardId) => {
  cardInfoModalImage.src = '';
  cardInfoModalImage.alt = 'Загрузка...';
  cardInfoModalInfoList.innerHTML = '<p>Загрузка информации...</p>';
  cardInfoModalUsersList.innerHTML = '';
  
  api.getCardList()
    .then((cards) => {
      const cardData = cards.find(card => card._id === cardId);
      
      if (!cardData) {
        console.error('Карточка не найдена');
        cardInfoModalInfoList.innerHTML = '<p>Карточка не найдена</p>';
        return;
      }
      
      cardInfoModalInfoList.innerHTML = '';
      cardInfoModalUsersList.innerHTML = '';
      
      cardInfoModalImage.src = cardData.link;
      cardInfoModalImage.alt = cardData.name;
     
      cardInfoModalInfoList.append(
        createInfoString("Название:", cardData.name)
      );
      
      cardInfoModalInfoList.append(
        createInfoString("Автор:", cardData.owner.name)
      );
      
      cardInfoModalInfoList.append(
        createInfoString("Описание автора:", cardData.owner.about || "Нет описания")
      );
      
      cardInfoModalInfoList.append(
        createInfoString("Дата создания:", formatDate(new Date(cardData.createdAt)))
      );
      
      cardInfoModalInfoList.append(
        createInfoString("Количество лайков:", cardData.likes.length.toString())
      );
      
      if (cardData.likes.length > 0) {
        cardData.likes.forEach(user => {
          cardInfoModalUsersList.append(createUserPreview(user));
        });
      } else {
        const noLikesElement = document.createElement('p');
        noLikesElement.textContent = 'Пока никто не лайкнул эту карточку';
        noLikesElement.classList.add('popup-info__no-likes');
        cardInfoModalUsersList.append(noLikesElement);
      }

      openModalWindow(cardInfoModalWindow);
    })
    .catch((err) => {
      console.error('Ошибка при получении данных карточки:', err);
      cardInfoModalInfoList.innerHTML = '<p>Ошибка загрузки данных</p>';
    });
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = evt.target.querySelector('.popup__button');
  const originalText = submitButton.textContent;

  updateButtonText(submitButton, true, originalText, 'Сохранение...');
  
  api.setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      closeModalWindow(profileFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      updateButtonText(submitButton, false, originalText, 'Сохранение...');
    });
};

const handleAvatarFromSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = evt.target.querySelector('.popup__button');
  const originalText = submitButton.textContent;

  updateButtonText(submitButton, true, originalText, 'Сохранение...');
  
  api.setUserAvatar(avatarInput.value)
    .then((userData) => {
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
      closeModalWindow(avatarFormModalWindow);
      avatarForm.reset();
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      updateButtonText(submitButton, false, originalText, 'Сохранение...');
    });
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = evt.target.querySelector('.popup__button');
  const originalText = submitButton.textContent;
  
  updateButtonText(submitButton, true, originalText, 'Создание...');
  
  api.addCard({
    name: cardNameInput.value,
    link: cardLinkInput.value,
  })
    .then((cardData) => {
      placesWrap.prepend(
        createCardElement(
          cardData,
          {
            onPreviewPicture: handlePreviewPicture,
            onLikeIcon: handleLikeClick,
            onDeleteCard: handleDeleteCard,
            onInfoClick: handleInfoClick,
            currentUserId: currentUserId
          }
        )
      );
      closeModalWindow(cardFormModalWindow);
      cardForm.reset();
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      updateButtonText(submitButton, false, originalText, 'Создание...');
    });
};

const handleLikeClick = (likeButton, cardId, isLiked, likeCountElement) => {
  api.changeLikeCardStatus(cardId, isLiked)
    .then((updatedCard) => {
      likeButton.classList.toggle("card__like-button_is-active", !isLiked);
      
      if (likeCountElement) {
        likeCountElement.textContent = updatedCard.likes.length;
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

const handleDeleteCard = (cardElement, cardId) => {
  api.deleteCardApi(cardId)
    .then(() => {
      cardElement.remove();
    })
    .catch((err) => {
      console.log(err);
    });
};

profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFromSubmit);

openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  clearValidation(profileForm, validationSettings);
  openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationSettings);
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  clearValidation(cardForm, validationSettings);
  openModalWindow(cardFormModalWindow);
});

Promise.all([api.getUserInfo(), api.getCardList()])
  .then(([userData, cards]) => {
    currentUserId = userData._id;

    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
    
    cards.reverse().forEach((cardData) => {
      placesWrap.append(
        createCardElement(
          cardData,
          {
            onPreviewPicture: handlePreviewPicture,
            onLikeIcon: handleLikeClick,
            onDeleteCard: handleDeleteCard,
            onInfoClick: handleInfoClick,
            currentUserId: currentUserId
          }
        )
      );
    });
  })
  .catch((err) => {
    console.log(err);
  });

const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

const validationSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

enableValidation(validationSettings);