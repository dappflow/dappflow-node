const contractResource = ({httpAgent}) => {
  const basePath = '/organisations/{orgId}/apps/{appId}';

  const events = {
    list: httpAgent({
      method: 'GET',
      path: `${basePath}/events`
    })
  };

  return {events};
};

module.exports = contractResource;
