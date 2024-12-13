#virtual env name -backend

from flask import Flask, jsonify
from flask_cors import CORS
import psutil
import platform
from datetime import datetime
import GPUtil  # Install using `pip install gputil`
import time
import numpy as np
import os


app = Flask(__name__)
CORS(app)

def gather_system_info():
    try:
        # CPU Information
        cpu_info = {
            "physical_cores": psutil.cpu_count(logical=False),
            "total_cores": psutil.cpu_count(logical=True),
            "frequency": psutil.cpu_freq()._asdict(),
            "usage": psutil.cpu_percent(interval=1),
        }

        # Memory Information
        memory_info = psutil.virtual_memory()._asdict()

        # Disk Information
        disk_info = [disk._asdict() for disk in psutil.disk_partitions()]
        disk_usage = [psutil.disk_usage(disk.mountpoint)._asdict() for disk in psutil.disk_partitions()]

        # GPU Information
        gpus = GPUtil.getGPUs()
        gpu_info = [
            {
                "id": gpu.id,
                "name": gpu.name,
                "load": f"{gpu.load * 100:.1f}%",
                "memory_total": f"{gpu.memoryTotal}MB",
                "memory_used": f"{gpu.memoryUsed}MB",
                "memory_free": f"{gpu.memoryFree}MB",
                "temperature": f"{gpu.temperature}°C",
            }
            for gpu in gpus
        ]

        # Battery Information
        battery = psutil.sensors_battery()
        battery_info = battery._asdict() if battery else "Battery info not available"

        # OS Information
        os_info = {
            "system": platform.system(),
            "node_name": platform.node(),
            "release": platform.release(),
            "version": platform.version(),
            "machine": platform.machine(),
            "processor": platform.processor(),
        }

        # Construct response
        system_info = {
            "cpu": cpu_info,
            "memory": memory_info,
            "disk": {"partitions": disk_info, "usage": disk_usage},
            "gpu": gpu_info,
            "battery": battery_info,
            "os": os_info,
            "boot_time": datetime.fromtimestamp(psutil.boot_time()).strftime("%Y-%m-%d %H:%M:%S"),
        }

        return system_info

    except Exception as e:
        return {"error": str(e)}
    
#for benchmarking information
def gather_benchmark_info():
    try:
        def cpu_benchmark():
            print("Running CPU benchmark...")
            start = time.time()
            for _ in range(1000000):
                x = 3.14159 ** 2  # Simple CPU-intensive task
            duration = time.time() - start
            score = 1000 / duration
            print(f"CPU Benchmark Score: {score:.2f}")
            return score

        def memory_benchmark():
            print("Running Memory benchmark...")
            start = time.time()
            size = 500_000_000  # Allocate 500MB memory
            arr = np.random.rand(size)
            duration = time.time() - start
            del arr  # Free memory
            score = 1000 / duration
            print(f"Memory Benchmark Score: {score:.2f}")
            return score

        def disk_benchmark():
            print("Running Disk benchmark...")
            test_file = "disk_benchmark_test_file"
            start = time.time()
            with open(test_file, "wb") as f:
                f.write(os.urandom(500 * 1024 * 1024))  # Write 500MB random data
            duration_write = time.time() - start
            
            start = time.time()
            with open(test_file, "rb") as f:
                _ = f.read()
            duration_read = time.time() - start
            os.remove(test_file)
            
            write_score = 500 / duration_write
            read_score = 500 / duration_read
            total_score = (write_score + read_score) / 2
            print(f"Disk Benchmark Score: {total_score:.2f}")
            return total_score
        
        cpu_score = cpu_benchmark()
        memory_score = memory_benchmark()
        disk_score = disk_benchmark()
        total_score = cpu_score * 0.4 + memory_score * 0.3 + disk_score * 0.2 

        # Construct response
        benchmark_info = {
                "cpu_score": cpu_score,
                "memory_score": memory_score,
                "disk_score": disk_score,
                "total_score": total_score,
                
            }

        return benchmark_info
    except Exception as e:
        return {"error": str(e)}

        















@app.route('/info', methods=['GET'])
def get_system_info():
    return jsonify(gather_system_info())


@app.route('/benchmark',methods=['GET'])
def get_benchmark_info():
    return jsonify(gather_benchmark_info())

# Testing outside the request context
if __name__ == '__main__':
    """ with app.app_context():
        print(gather_system_info())  # Call without Flask context issues
        print(gather_benchmark_info()) """
    app.run(debug=True, port=5000)
