#app/utils/logger.py

import logging

# Configuração de logs
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)

logger = logging.getLogger("hyperlearn_logger")
