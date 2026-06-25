'use client';

import Header from '@/components/header';
import ProductEntry from '@/components/product-entry';

export default function Dashboard() {
  return (
    <div className="w-full">
        <Header title="Dashboard" subtitle="Welcome back to your POS system" />
        
        <div className="p-0">
         
          <div className="">
              
            <ProductEntry />
          </div> 
        </div>
      </div>
    
  );
}
