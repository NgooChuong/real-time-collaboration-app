import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
const isProduction = process.env.NODE_ENV === 'production';
const options = {
  definition: {
    openapi: '3.1.0',
    info: {
      title: 'Real-time Collaboration App API',
      version: '1.0.0',
      description:
        'API for real-time collaboration application with authentication, messaging, and user management',
    },
    servers: [
      {
        url: isProduction
          ? 'https://real-time-collaboration-app-d8lx.onrender.com'
          : 'http://localhost:3000',
        description: isProduction ? 'Production server' : 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/modules/*/*.ts'],
};
const specs = swaggerJsdoc(options);
const swaggerInit = (app: Express) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
};
export default swaggerInit;
