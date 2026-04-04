import app from './app';
import { config } from './config';
import { logger } from './config/logger';

const server = app.listen(config.port, () => {
   logger.info(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
});

process.on('unhandledRejection', (reason) => {
   logger.error(reason, 'Unhandled rejection');
});

process.on('uncaughtException', (error) => {
   logger.fatal(error, 'Uncaught exception');
   server.close(() => process.exit(1));
});

export default server;
