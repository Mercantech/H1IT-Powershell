import os
import time
import paramiko

pw = os.environ["LAB_SSH_PASSWORD"]
host = os.environ.get("LAB_SSH_HOST", "10.133.71.101")

for i in range(1, 61):
    try:
        print(f"retry {i}/60...", flush=True)
        c = paramiko.SSHClient()
        c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        c.connect(
            host,
            username="Administrator",
            password=pw,
            allow_agent=False,
            look_for_keys=False,
            timeout=20,
            banner_timeout=40,
        )
        stdin, stdout, stderr = c.exec_command(
            "powershell -NoProfile -Command \"hostname; "
            "Get-CimInstance Win32_ComputerSystem | Format-List Name,Domain,DomainRole; "
            "Get-WindowsFeature AD-Domain-Services,DNS,DHCP,FS-FileServer | "
            "Format-Table Name,InstallState -AutoSize\"",
            timeout=90,
        )
        print(stdout.read().decode("utf-8", "replace"), flush=True)
        err = stderr.read().decode("utf-8", "replace").strip()
        if err:
            print("ERR:", err, flush=True)
        c.close()
        raise SystemExit(0)
    except Exception as ex:  # noqa: BLE001
        print(f"  {ex}", flush=True)
        time.sleep(15)

raise SystemExit(1)
