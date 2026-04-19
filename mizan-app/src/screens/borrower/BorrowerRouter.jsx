import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBorrower } from '../../context/BorrowerContext'

export default function BorrowerRouter() {
  const { applicationStage, activeLoan } = useBorrower()
  const navigate = useNavigate()

  useEffect(() => {
    if (activeLoan) {
      navigate('/borrower/loan', { replace: true })
    } else if (applicationStage === 'review') {
      navigate('/borrower/review', { replace: true })
    } else if (applicationStage === 'decided') {
      navigate('/borrower/decision', { replace: true })
    } else {
      // No active loan, no pending application → show empty state dashboard
      navigate('/borrower/home', { replace: true })
    }
  }, [applicationStage, activeLoan, navigate])

  return null
}
