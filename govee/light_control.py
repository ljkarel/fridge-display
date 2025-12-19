import asyncio
import websockets
from bleak import BleakClient, BleakError

mac_address = "C9:38:32:30:63:51"
notify_char_uuid = "00010203-0405-0607-0809-0a0b0c0d2b10"
write_char_uuid = "00010203-0405-0607-0809-0a0b0c0d2b11"

command_on = bytearray.fromhex("3301010000000000000000000000000000000033")
command_off = bytearray.fromhex("3301000000000000000000000000000000000032")
keep_alive = bytearray.fromhex("AA010100000000000000000000000000000000AA")
illuminate = bytearray.fromhex("3305043F0000000000000000000000000000000D")


def append_xor(input_string):
    byte_array = bytearray.fromhex(input_string)
    xor_result = 0
    for byte in byte_array:
        xor_result ^= byte
    return f"{input_string}{xor_result:02x}"


def create_color_command(red, green, blue):
    if not (0 <= red <= 255 and 0 <= green <= 255 and 0 <= blue <= 255):
        raise ValueError("Color values must be between 0 and 255.")
    return bytearray.fromhex(
        append_xor(f"33051501{red:02x}{green:02x}{blue:02x}0000000000FFFFFF3F000000")
    )


def create_brightness_command(brightness):
    if brightness < 0 or brightness > 100:
        raise ValueError("Brightness must be between 0 and 100.")
    return bytearray.fromhex(
        append_xor(f"3304{brightness:02x}00000000000000000000000000000000")
    )


async def keep_alive_loop(client):
    while True:
        try:
            await client.write_gatt_char(write_char_uuid, keep_alive)
            await asyncio.sleep(2)
        except Exception as e:
            print(f"Keep-alive failed: {e}")
            break


async def handle_websocket(websocket, client):
    print(f"WebSocket client connected: {websocket.remote_address}")
    try:
        async for message in websocket:
            cmd = message.strip().lower()
            try:
                if cmd == "on":
                    await client.write_gatt_char(write_char_uuid, command_on)
                elif cmd == "off":
                    await client.write_gatt_char(write_char_uuid, command_off)
                elif cmd.startswith("brightness"):
                    _, brightness = cmd.split()
                    await client.write_gatt_char(
                        write_char_uuid, create_brightness_command(int(brightness))
                    )
                elif cmd.startswith("color"):
                    _, r, g, b = cmd.split()
                    await client.write_gatt_char(
                        write_char_uuid, create_color_command(int(r), int(g), int(b))
                    )
                elif cmd == "illuminate":
                    await client.write_gatt_char(write_char_uuid, illuminate)
                elif cmd == "exit":
                    await websocket.send("Disconnecting...")
                    break
                else:
                    await websocket.send(f"Unknown command: {cmd}")
                    continue

                await websocket.send(f"Executed: {cmd}")

            except Exception as e:
                await websocket.send(f"Error: {e}")

    except websockets.exceptions.ConnectionClosed:
        print("WebSocket client disconnected")


async def websocket_server(client, host="0.0.0.0", port=8765):
    server = await websockets.serve(
        lambda ws: handle_websocket(ws, client), host, port
    )
    print(f"WebSocket server running on ws://{host}:{port}")
    await server.wait_closed()


async def main():
    while True:
        try:
            async with BleakClient(mac_address, timeout=30) as client:
                print(f"Connected to {mac_address}")

                await client.start_notify(notify_char_uuid, lambda s, d: None)

                await asyncio.gather(
                    keep_alive_loop(client),
                    websocket_server(client)
                )

        except BleakError as e:
            print(f"BLE error: {e}, retrying in 5 seconds...")
            await asyncio.sleep(5)
        except asyncio.TimeoutError:
            print("Connection timed out, retrying in 5 seconds...")
            await asyncio.sleep(5)
        except Exception as e:
            print(f"Unexpected error: {e}, retrying in 5 seconds...")
            await asyncio.sleep(5)


if __name__ == "__main__":
    asyncio.run(main())
