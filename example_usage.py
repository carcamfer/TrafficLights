from plc_controller import PLCController
import time

def example_plc_operations():
    # Create PLC controller instance
    # Replace these parameters with your PLC's actual IP address and configuration
    plc = PLCController(
        ip="192.168.0.1",  # Replace with your PLC's IP address
        rack=0,            # Default rack number
        slot=1             # Default slot number
    )

    try:
        # Connect to PLC
        if plc.connect():
            print("Connected to PLC successfully!")

            # Example 1: Read from a data block
            print("\nReading from DB...")
            data = plc.read_db(db_number=1, start=0, size=4)
            if data:
                print(f"Read data (hex): {data.hex()}")

            # Example 2: Write to a data block
            print("\nWriting to DB...")
            test_data = bytearray([0x00, 0x01, 0x02, 0x03])
            if plc.write_db(db_number=1, start=0, data=test_data):
                print("Write operation successful!")

            # Example 3: Read back the written data
            print("\nReading back written data...")
            read_back = plc.read_db(db_number=1, start=0, size=4)
            if read_back:
                print(f"Read back data (hex): {read_back.hex()}")

            # Add a small delay to see the results
            time.sleep(1)

    except Exception as e:
        print(f"An error occurred: {str(e)}")

    finally:
        # Always disconnect when done
        plc.disconnect()
        print("\nDisconnected from PLC")

if __name__ == "__main__":
    print("Starting PLC communication example...")
    example_plc_operations()
