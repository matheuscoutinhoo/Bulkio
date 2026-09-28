import app from './app';
import { config } from './config';
import { logger } from './config/logger';
import prisma from './config/database';

const server = app.listen(config.port, () => {
   logger.info(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
});

process.on('unhandledRejection', (reason) => {
   logger.error(reason, 'Unhandled rejection');
});

function shutdown(signal: string, exitCode = 0) {
   logger.info({ signal }, 'Shutting down server');
   server.close(async (error) => {
      if (error) logger.error(error, 'Error while closing HTTP server');
      await prisma.$disconnect();
      process.exit(error ? 1 : exitCode);
   });
}

process.on('uncaughtException', (error) => {
   logger.fatal(error, 'Uncaught exception');
   shutdown('uncaughtException', 1);
});

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default server;
