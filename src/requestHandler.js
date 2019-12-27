const requestHandler = async request => {
  // in the future, we can add more logic to the way we handle responses and retry mechanisms.
  try {
    return await request;
  }
  catch(e) {
    // we will add here more logic for errors
    throw Error(e.message);
  }
};

module.exports = {
  requestHandler
};
