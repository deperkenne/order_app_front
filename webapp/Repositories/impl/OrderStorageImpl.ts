import { IOrderStorageRepo } from "../IOrderStorageRepository";

export class OrderStorageImpl implements IOrderStorageRepo {
  
  private readonly ORDER_UUID_KEY = 'app_order_uuid';
  private readonly ORDER_EXPIRY_KEY = 'app_order_expiry';
  private readonly ORDER_EXPIRY_TIME = 7 * 24 * 60 * 60 * 1000; // 7 jours


  getOrderUuid(): string | null {
    try {
      const uuid = localStorage.getItem(this.ORDER_UUID_KEY);
      const expiry = localStorage.getItem(this.ORDER_EXPIRY_KEY);
      
      console.log("getorderUuid:", uuid)
      // Vérifier l'expiration
      if (uuid && expiry) {
        const expiryTime = parseInt(expiry, 10);
        if (Date.now() < expiryTime) {
          console.log(' OrderUUID trouvé:', uuid);
          return uuid;
        } else {
          //  UUID expiré, le supprimer
          this.clearOrderUuid();
          
          console.log(' OrderUUID expiré');
        }
      }
    } catch (error) {
      console.error(' Erreur lecture OrderUUID:', error);
    }
    
    return null;
  }

 
  setOrderUuid(uuid: string): void {
    try {
      const expiryTime = Date.now() + this.ORDER_EXPIRY_TIME;
    
      localStorage.setItem(this.ORDER_UUID_KEY, uuid);
      localStorage.setItem(this.ORDER_EXPIRY_KEY, expiryTime.toString());
      
      console.log('OrderUUID sauvegardé:', uuid);
    } catch (error) {
      console.error('Erreur sauvegarde OrderUUID:', error);
    }
  }

  clearOrderUuid(): void {
    try {
      localStorage.removeItem(this.ORDER_UUID_KEY);
      localStorage.removeItem(this.ORDER_EXPIRY_KEY);
      console.log('🗑️ OrderUUID supprimé');
    } catch (error) {
      console.error('Erreur suppression OrderUUID:', error);
    }
  }


  // Vérifier si un UUID existe
   
  hasOrderUuid(): boolean {
    return this.getOrderUuid() !== null;
  }
}