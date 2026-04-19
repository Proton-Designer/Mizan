import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBorrower } from '../../context/BorrowerContext'

export default function BorrowerRouter() {
  const { applicationStage } = useBorrower()
  const navigate = useNavigate()

  useEffect(() => {
    const routes = {
      pre_application: '/borrower/intake',
      intake: '/borrower/intake',
      verification: '/borrower/verification',
      review: '/borrower/review',
      decided: '/borrower/decision',
      active_loan: '/borrower/loan'
    }
    navigate(routes[applicationStage] || '/borrower/review', { replace: true })
  }, [applicationStage, navigate])

  return null
}
