export async function uploadOrders(file: File) {
    const formData = new FormData();
    formData.append('file', file);
  
    try {
      const res = await fetch('http://192.168.1.105:3001/api/upload', {
        method: 'POST',
        body: formData,
      });
  
      const data = await res.json();
      return { success: res.ok, message: data.message };
    } catch (error) {
      return { success: false, message: 'Network error :', error };
    }
  }
  