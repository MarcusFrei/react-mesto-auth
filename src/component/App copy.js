import { useEffect, useState } from "react";
import "../../src/App.css";
import Footer from "./Footer";
import Header from "./Header";
import Main from "./Main";
import EditAvatarPopup from "./EditAvatarPopup";
import { api } from "../api/Api";
import EditProfilePopup from "./EditProfilePopup";
import AddCardPopup from "./AddCardPopup";
import ImagePopup from "./ImagePopup";
import { CurrentUserContext } from "../contexts/CurrentUserContext";
import { Route, Routes, useNavigate } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import InfoToolTip from "./InfoToolTip";
import { auth } from "../api/auth";

function App() {
  const [isEditAvatarOpened, setIsEditAvatarOpened] = useState(false);
  const [isEditProfileOpened, setIsEditProfileOpened] = useState(false);
  const [isAddCardOpened, setIsAddCardOpened] = useState(false);
  const [isCardPopupOpened, setIsCardPopupOpened] = useState(false);
  const [currentUser, setCurrentUser] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [cards, setCards] = useState([]);
  const [currentOpenCard, setCurrentOpenCard] = useState({});
  const [isRegistrationSuccessful, setIsRegistrationSuccessful] =
    useState(true);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const [email, setEmail] = useState("");
  const isPopupsOpened =
    isEditAvatarOpened ||
    isEditProfileOpened ||
    isAddCardOpened ||
    isCardPopupOpened ||
    isTooltipOpen;

  useEffect(() => {
    api.getUserInfo().then((data) => setCurrentUser(data));
    api.getInitialCards().then((data) => setCards(data));
  }, []);

  useEffect(() => {
    if (isPopupsOpened) {
      document.addEventListener("keydown", closePopupByEsape);
      document.addEventListener("mousedown", closePopupByOverlay);
    }
    return () => {
      document.removeEventListener("keydown", closePopupByEsape);
      document.removeEventListener("mousedown", closePopupByOverlay);
    };
  }, [isPopupsOpened]);

  function closePopupByEsape(e) {
    if (e.key === "Escape") {
      console.log("escape");
      closeAllPopups();
    }
  }

  function closePopupByOverlay(e) {
    if (e.target.classList.contains("popup_opened")) {
      console.log("over close");
      closeAllPopups();
    }
  }

  function handleEditAvatarClick() {
    setIsEditAvatarOpened(true);
  }

  function handleEditProfileClick() {
    setIsEditProfileOpened(true);
  }

  function handleToolTipOpen() {
    setIsTooltipOpen(true);
  }

  function handleAddCardClick() {
    setIsAddCardOpened(true);
  }

  function handleOpenCardClick(card) {
    setIsCardPopupOpened(true);
    setCurrentOpenCard(card);
  }

  function closeAllPopups() {
    setIsEditAvatarOpened(false);
    setIsEditProfileOpened(false);
    setIsAddCardOpened(false);
    setIsCardPopupOpened(false);
    setIsTooltipOpen(false);
  }

  function updateAvatar(obj) {
    console.log("api avatar");
    setIsLoading(true);
    api
      .updateAvatar(obj)
      .then((data) => {
        setCurrentUser(data);
        closeAllPopups();
      })
      .catch((e) => console.log(e))
      .finally(() => setIsLoading(false));
  }

  function addCard(obj) {
    console.log(obj);
    setIsLoading(true);
    api
      .sendNewCard(obj)
      .then((data) => {
        setCards([data, ...cards]);
        closeAllPopups();
      })
      .catch((e) => console.log(e))
      .finally(() => setIsLoading(false));
  }

  function updateUserInfo(obj) {
    console.log("api profile");
    setIsLoading(true);
    api
      .editProfile(obj)
      .then((data) => {
        setCurrentUser(data);
        closeAllPopups();
      })
      .catch((e) => console.log(e))
      .finally(() => setIsLoading(false));
  }

  function deleteCard(id) {
    console.log(id);
    setIsLoading(true);
    api
      .deleteCard(id)
      .then((data) => {
        console.log(data);
        const tempCopy = cards.filter((card) => card._id !== id);
        setCards(tempCopy);

        closeAllPopups();
      })
      .catch((e) => console.log(e))
      .finally(() => setIsLoading(false));
  }

  function setLike(card) {
    const isCardLiked = card.likes.some((elem) => elem._id === currentUser._id);

    if (!isCardLiked) {
      api
        .setLike(card._id)
        .then((data) => {
          console.log(data);
          const tempCopy = cards.map((card) =>
            card._id === data._id ? data : card
          );
          setCards(tempCopy);
        })
        .catch((e) => console.log(e));
    } else {
      api
        .deleteLike(card._id)
        .then((data) => {
          console.log(data);
          const tempCopy = cards.map((card) =>
            card._id === data._id ? data : card
          );
          setCards(tempCopy);
        })
        .catch((e) => console.log(e));
    }
  }

  const navigate = useNavigate();
  function handleRegister(email, password) {
    auth
      .register(email, password)
      .then((data) => {
        setEmail(data.data.email);
        setIsRegistrationSuccessful(true);
        navigate("/sign-in");
      })
      .catch((e) => setIsRegistrationSuccessful(false))
      .finally(() => handleToolTipOpen());
  }

  return (
    <CurrentUserContext.Provider value={currentUser}>
      <div>
        <InfoToolTip
          isOpen={isTooltipOpen}
          onClose={closeAllPopups}
          isSuccess={isRegistrationSuccessful}
        />
        <ImagePopup
          card={currentOpenCard}
          isOpen={isCardPopupOpened}
          onClose={closeAllPopups}
        />

        <EditAvatarPopup
          handleSubmit={updateAvatar}
          isOpen={isEditAvatarOpened}
          onClose={closeAllPopups}
          isLoading={isLoading}
        />

        <EditProfilePopup
          handleSubmit={updateUserInfo}
          isOpen={isEditProfileOpened}
          onClose={closeAllPopups}
          isLoading={isLoading}
          //userInfo={currentUser}
        />

        <AddCardPopup
          handleSubmit={addCard}
          isOpen={isAddCardOpened}
          onClose={closeAllPopups}
          isLoading={isLoading}
        />

        <Header />
        <Routes>
          <Route
            path="/"
            element={
              <Main
                onEditAvatarOpen={handleEditAvatarClick}
                onEditProfileOpen={handleEditProfileClick}
                onAddCardOpen={handleAddCardClick}
                onDeleteCard={deleteCard}
                onCardLike={setLike}
                onCardOpen={handleOpenCardClick}
                cards={cards}
              />
            }
          />
          <Route path="/sign-in" element={<Login />} />
          <Route
            path="/sign-up"
            element={<Register onSubmit={handleRegister} />}
          />
        </Routes>

        <Footer />
      </div>
    </CurrentUserContext.Provider>
  );
}

export default App;
