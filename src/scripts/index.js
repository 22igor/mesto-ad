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
const cardInfoModalInfoList = cardInfoModalWindow.querySelector('.popup-info__list');
const cardInfoModalUsersList = cardInfoModalWindow.querySelector('.popup-info__users-list');

const removeCardModalWindow = document.querySelector('.popup_type_remove-card');
const removeCardForm = removeCardModalWindow.querySelector('.popup__form');

let currentUserId = null;
let cardToDelete = { element: null, id: null };
let cachedCards = null;

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
  const userElement = document.createElement('div');
  userElement.classList.add('popup-info__user-preview');
  
  const nameElement = document.createElement('span');
  nameElement.classList.add('popup-info__user-preview-name');
  nameElement.textContent = user.name || 'Неизвестно';
  
  userElement.appendChild(nameElement);
  
  return userElement;
};

const handleInfoClick = (cardId) => {
  cardInfoModalInfoList.innerHTML = '<p class="popup-info__loading">Загрузка информации...</p>';
  cardInfoModalUsersList.innerHTML = '';
  
  openModalWindow(cardInfoModalWindow);
  
  const getCardData = () => {
    if (cachedCards) {
      return Promise.resolve(cachedCards);
    } else {
      return api.getCardList()
        .then(cards => {
          cachedCards = cards;
          return cards;
        });
    }
  };
  
  getCardData()
    .then((cards) => {
      const cardData = cards.find(card => card._id === cardId);
      
      if (!cardData) {
        throw new Error('Карточка не найдена');
      }
      
      cardInfoModalInfoList.innerHTML = '';
      cardInfoModalUsersList.innerHTML = '';
      
      // Создаем элементы информации о карточке (без описания автора)
      const infoElements = [
        { term: "Описание:", definition: cardData.name },
        { term: "Дата создания:", definition: formatDate(new Date(cardData.createdAt)) },
        { term: "Владелец:", definition: cardData.owner.name },
        { term: "Количество лайков:", definition: cardData.likes.length.toString() }
      ];
      
      infoElements.forEach(info => {
        cardInfoModalInfoList.appendChild(createInfoString(info.term, info.definition));
      });
      
      // Список пользователей, лайкнувших карточку
      if (cardData.likes.length > 0) {
        cardData.likes.forEach(user => {
          cardInfoModalUsersList.appendChild(createUserPreview(user));
        });
      } else {
        const noLikesElement = document.createElement('p');
        noLikesElement.textContent = 'Пока никто не лайкнул эту карточку';
        noLikesElement.classList.add('popup-info__no-likes');
        cardInfoModalUsersList.appendChild(noLikesElement);
      }
    })
    .catch((err) => {
      console.error('Ошибка при получении данных карточки:', err);
      cardInfoModalInfoList.innerHTML = '<p class="popup-info__error">Ошибка загрузки данных.</p>';
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
      if (cachedCards) {
        cachedCards.unshift(cardData);
      }
      
      placesWrap.prepend(
        createCardElement(
          cardData,
          {
            onPreviewPicture: handlePreviewPicture,
            onLikeIcon: handleLikeClick,
            onDeleteCard: handleDeleteCardClick,
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
      
      if (cachedCards) {
        const cardIndex = cachedCards.findIndex(card => card._id === cardId);
        if (cardIndex !== -1) {
          cachedCards[cardIndex] = updatedCard;
        }
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

const handleDeleteCardClick = (cardElement, cardId) => {
  cardToDelete = { element: cardElement, id: cardId };
  openModalWindow(removeCardModalWindow);
};

const handleRemoveCardConfirm = (evt) => {
  evt.preventDefault();
  const submitButton = evt.target.querySelector('.popup__button');
  const originalText = submitButton.textContent;

  updateButtonText(submitButton, true, originalText, 'Удаление...');
  
  api.deleteCardApi(cardToDelete.id)
    .then(() => {
      cardToDelete.element.remove();
      closeModalWindow(removeCardModalWindow);
      
      if (cachedCards) {
        cachedCards = cachedCards.filter(card => card._id !== cardToDelete.id);
      }
      
      cardToDelete = { element: null, id: null };
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      updateButtonText(submitButton, false, originalText, 'Удаление...');
    });
};

profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFromSubmit);
removeCardForm.addEventListener("submit", handleRemoveCardConfirm);

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
    cachedCards = cards;

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
            onDeleteCard: handleDeleteCardClick,
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