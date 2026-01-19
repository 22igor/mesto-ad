// Очищает все ошибки валидации формы и делает кнопку неактивной
export const clearValidation = (form, settings) => {
  const inputs = form.querySelectorAll(settings.inputSelector);
  const button = form.querySelector(settings.submitButtonSelector);
  
  // Убираем ошибки со всех полей
  inputs.forEach(input => {
    const error = form.querySelector(`#${input.id}-error`);
    if (error) {
      input.classList.remove(settings.inputErrorClass);
      error.textContent = '';
      error.classList.remove(settings.errorClass);
    }
  });
  
  // Делаем кнопку неактивной
  if (button) {
    button.classList.add(settings.inactiveButtonClass);
    button.disabled = true;
  }
};

// Включает валидацию для всех форм на странице
export const enableValidation = (settings) => {
  // Для каждой формы на странице
  document.querySelectorAll(settings.formSelector).forEach(form => {
    const inputs = form.querySelectorAll(settings.inputSelector);
    const button = form.querySelector(settings.submitButtonSelector);
    
    // Функция проверки всей формы
    const checkForm = () => {
      let hasError = false;
      
      // Проверяем каждое поле
      inputs.forEach(input => {
        const error = form.querySelector(`#${input.id}-error`);
        
        if (!input.validity.valid) {
          hasError = true;
          if (error) {
            // Показываем ошибку с кастомным или стандартным сообщением
            input.classList.add(settings.inputErrorClass);
            error.textContent = input.dataset.errorMessage && input.validity.patternMismatch 
              ? input.dataset.errorMessage 
              : input.validationMessage;
            error.classList.add(settings.errorClass);
          }
        } else if (error) {
          // Скрываем ошибку если поле валидно
          input.classList.remove(settings.inputErrorClass);
          error.textContent = '';
          error.classList.remove(settings.errorClass);
        }
      });
      
      // Включаем/выключаем кнопку в зависимости от наличия ошибок
      if (button) {
        button.classList.toggle(settings.inactiveButtonClass, hasError);
        button.disabled = hasError;
      }
    };
    
    // Проверяем форму сразу при инициализации
    checkForm();
    
    // Проверяем форму при каждом вводе в любое поле
    inputs.forEach(input => {
      input.addEventListener('input', checkForm);
    });
  });
};