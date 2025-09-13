import "dotenv/config";

const config = {
  client: {
    service: {
      url: `${process.env.VITE_API_URL}/graphql`,
    },
  },
};

export default config;
