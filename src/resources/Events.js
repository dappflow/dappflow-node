const contractResource = ({httpAgent}) => {
  const basePath = 'apps/{appId}';

  const events = {
    list: httpAgent({
      method: 'GET',
      path: `${basePath}/events`
    })
  };

  return {events};
};

module.exports = contractResource;
