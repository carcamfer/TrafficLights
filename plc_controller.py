import snap7
from snap7.util import *
from typing import Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PLCController:
    def __init__(self, ip: str, rack: int = 0, slot: int = 1):
        """
        Initialize PLC connection
        Args:
            ip: IP address of the PLC
            rack: Rack number (default is 0)
            slot: Slot number (default is 1)
        """
        self.ip = ip
        self.rack = rack
        self.slot = slot
        self.client = snap7.client.Client()
        self.connected = False

    def connect(self) -> bool:
        """Connect to the PLC"""
        try:
            self.client.connect(self.ip, self.rack, self.slot)
            self.connected = True
            logger.info(f"Successfully connected to PLC at {self.ip}")
            return True
        except Exception as e:
            logger.error(f"Failed to connect to PLC: {str(e)}")
            return False

    def disconnect(self):
        """Disconnect from the PLC"""
        if self.connected:
            self.client.disconnect()
            self.connected = False
            logger.info("Disconnected from PLC")

    def read_db(self, db_number: int, start: int, size: int) -> Optional[bytearray]:
        """
        Read data from a DB (Data Block)
        Args:
            db_number: DB number to read from
            start: Starting byte
            size: Number of bytes to read
        Returns:
            Bytearray of data if successful, None if failed
        """
        try:
            data = self.client.db_read(db_number, start, size)
            logger.info(f"Successfully read {size} bytes from DB{db_number}")
            return data
        except Exception as e:
            logger.error(f"Failed to read from DB: {str(e)}")
            return None

    def write_db(self, db_number: int, start: int, data: bytearray) -> bool:
        """
        Write data to a DB (Data Block)
        Args:
            db_number: DB number to write to
            start: Starting byte
            data: Data to write
        Returns:
            True if successful, False if failed
        """
        try:
            self.client.db_write(db_number, start, data)
            logger.info(f"Successfully wrote {len(data)} bytes to DB{db_number}")
            return True
        except Exception as e:
            logger.error(f"Failed to write to DB: {str(e)}")
            return False

def main():
    # Example usage
    plc = PLCController(ip="192.168.0.1")  # Replace with your PLC's IP address
    
    try:
        if plc.connect():
            # Example: Read 10 bytes from DB1 starting at byte 0
            data = plc.read_db(db_number=1, start=0, size=10)
            if data:
                print(f"Read data: {data.hex()}")

            # Example: Write data to DB1
            write_data = bytearray([1, 2, 3, 4, 5])
            if plc.write_db(db_number=1, start=0, data=write_data):
                print("Write successful")

    finally:
        plc.disconnect()

if __name__ == "__main__":
    main()
