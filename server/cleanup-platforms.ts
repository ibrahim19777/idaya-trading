// حذف الاتصالات المكررة وإصلاح الحالة
import { storage } from './storage';

export async function cleanupDuplicatePlatforms() {
  console.log('🧹 تنظيف الاتصالات المكررة...');
  
  // احذف جميع اتصالات MT5 المكررة
  const allPlatforms = await storage.getUserPlatforms(2); // User ID 2
  
  console.log(`🔍 عدد الاتصالات الموجودة: ${allPlatforms.length}`);
  
  // ابقِ فقط على آخر اتصال MT5
  const mt5Platforms = allPlatforms.filter(p => p.platform === 'mt5');
  
  if (mt5Platforms.length > 1) {
    console.log(`❌ وجد ${mt5Platforms.length} اتصالات MT5 مكررة`);
    
    // احذف الاتصالات القديمة، ابقِ على الأحدث
    const sortedByDate = mt5Platforms.sort((a, b) => a.id - b.id);
    const toDelete = sortedByDate.slice(0, -1); // احذف كل شيء عدا الأخير
    
    for (const platform of toDelete) {
      await storage.deletePlatform(platform.id);
      console.log(`🗑️ تم حذف اتصال MT5 مكرر (ID: ${platform.id})`);
    }
    
    // حدث الاتصال المتبقي ليكون متصل
    const remaining = sortedByDate[sortedByDate.length - 1];
    await storage.updatePlatform(remaining.id, {
      isConnected: true,
      connectionStatus: 'connected'
    });
    
    console.log(`✅ تم تحديث اتصال MT5 (ID: ${remaining.id}) ليكون متصل`);
  }
  
  console.log('🎉 تم تنظيف الاتصالات بنجاح!');
}