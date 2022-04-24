/* eslint-disable*/
//const Stripe = require('stripe');
import axios from 'axios';
import { showAlert } from './alerts';

export const bookTour = async (tourId) => {
  const stripe = Stripe(
    'pk_test_51KrcYDSGJC0BE6s8bXn6oxbPSZ69nLI5ogr4AuJm9jpcewUaB6hwrBDw5j2n3diFBKqzIKtUToXdTr0DDqkHO8Ke00vBdgGHDs'
  );
  try {
    //1)Get the checkout session from api
    const session = await axios(
      `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`
    );
    console.log(session);
    //2) Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
