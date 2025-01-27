const rootURL = "http://localhost:3002"; // กำหนด URL หลักสำหรับ API

export async function callLoginWS(method, sentData = {}) {
    let data;
    let response;
    const token = localStorage.getItem('authToken'); // ดึง token จาก localStorage หากมี

    switch (method) {
        case "signin":
            // กรณี signin (เข้าสู่ระบบ)
            response = await fetch(rootURL + '/signin', {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(sentData), // ส่งข้อมูลเข้าสู่ระบบเป็น JSON
            });
            console.log(response);
            data = await response.json(); // แปลงผลลัพธ์เป็น JSON
            console.log(data.token);

            if (data.token) {
                localStorage.setItem('authToken', data.token); // หากได้รับ token มา ให้บันทึกใน localStorage
                console.log(localStorage.getItem('authToken'));
            }

            break;
        case "logout":
            // กรณี logout (ออกจากระบบ)
            if (!token) {
                console.log("No token found. Cannot log out."); // หากไม่มี token ให้แสดงข้อความ
                return;
            }
            response = await fetch(rootURL + '/logout', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, // ใส่ token ใน header สำหรับการยืนยันตัวตน
                },
            });
            data = await response.json(); // แปลงผลลัพธ์เป็น JSON
            break;

        case "getUserProfile":
            try {
                // กรณีดึงข้อมูลโปรไฟล์ผู้ใช้
                response = await fetch(rootURL + '/UserAdminProfile', {
                    method: "GET",
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`, // ใส่ token เพื่อยืนยันตัวตน
                    },
                });
                data = await response.json(); // แปลงผลลัพธ์เป็น JSON
                const username = data.username; // ดึงชื่อผู้ใช้
                const profileImageUrl = data.profileImageUrl; // ดึง URL ของรูปโปรไฟล์
                console.log(profileImageUrl);

                // แสดงชื่อผู้ใช้ใน .header-right span
                const headerRightSpan = document.querySelector('.header-right span');
                if (headerRightSpan) {
                    headerRightSpan.textContent = username; // แสดงชื่อผู้ใช้ในส่วนนี้
                }

                // แสดงชื่อผู้ใช้ใน .user .user-link
                const userLink = document.querySelector('.user .user-link');
                if (userLink) {
                    userLink.textContent = username; // แสดงชื่อผู้ใช้ในลิงค์นี้
                }

                // แสดงรูปโปรไฟล์ใน #usericon
                const userImage = document.querySelector('#usericon');
                if (userImage) {
                    userImage.src = profileImageUrl; // ตั้งค่ารูปโปรไฟล์ในส่วนนี้
                }
                // เปลี่ยนข้อความและลิงค์ในปุ่ม login
                const loginButton = document.querySelector('.search a[href="/login"]');
                if (loginButton) {
                    loginButton.textContent = 'Management'; 
                    loginButton.href = '/Admin'; // เปลี่ยนลิงค์ไปยังหน้าการจัดการ
                }
            } catch (error) {
                console.error('Error fetching user profile:', error); // แสดงข้อผิดพลาดหากเกิดปัญหา
            }
            break;

    }

    return data; // คืนค่าข้อมูลจาก API
}
