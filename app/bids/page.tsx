import RoleGate from "@/components/RoleGate";
export default function Bids(){ 
  return (
    <RoleGate allow={['supplier','admin']}>
      <div className="p-6">Ваши ставки по заказам. Здесь будет история и статусы.</div>
    </RoleGate>
  )
}
