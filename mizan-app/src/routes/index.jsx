import { createBrowserRouter } from 'react-router-dom'
import Welcome from '../screens/Welcome'
import AppShell from '../components/layout/AppShell'
import PortfolioDashboard from '../screens/portfolio/Dashboard'
import PortfolioTransactions from '../screens/portfolio/Transactions'
import PortfolioVault from '../screens/portfolio/Vault'
import PortfolioVaultPerson from '../screens/portfolio/VaultPerson'
import PortfolioJourney from '../screens/portfolio/Journey'
import PortfolioJourneyPosition from '../screens/portfolio/JourneyPosition'
import PortfolioDiscover from '../screens/portfolio/Discover'
import PortfolioCauseDetail from '../screens/portfolio/CauseDetail'
import BorrowerRouter from '../screens/borrower/BorrowerRouter'
import BorrowerIntake from '../screens/borrower/Intake'
import BorrowerIntakeConfirm from '../screens/borrower/IntakeConfirm'
import BorrowerIntakeQuick from '../screens/borrower/IntakeQuick'
import BorrowerVerification from '../screens/borrower/Verification'
import BorrowerReview from '../screens/borrower/Review'
import BorrowerDecision from '../screens/borrower/Decision'
import BorrowerLoan from '../screens/borrower/Loan'
import BorrowerPayment from '../screens/borrower/Payment'
import BorrowerHardship from '../screens/borrower/Hardship'
import BorrowerHardshipExtension from '../screens/borrower/HardshipExtension'
import BorrowerHardshipRestructure from '../screens/borrower/HardshipRestructure'
import BorrowerHardshipConversion from '../screens/borrower/HardshipConversion'
import BorrowerHardshipSuccess from '../screens/borrower/HardshipSuccess'
import BorrowerHistory from '../screens/borrower/History'
import BorrowerAccount from '../screens/borrower/Account'
import CommunityDashboard from '../screens/community/Dashboard'
import CommunitySetup from '../screens/community/Setup'
import CommunityCircles from '../screens/community/Circles'
import CommunityCircleNew from '../screens/community/CircleNew'
import CommunityCircleDetail from '../screens/community/CircleDetail'
import CommunityVouching from '../screens/community/Vouching'
import CommunityVouchReview from '../screens/community/VouchReview'
import CommunityInsights from '../screens/community/Insights'
import NGODashboard from '../screens/ngo/Dashboard'
import NGOSetup from '../screens/ngo/Setup'
import NGOCampaigns from '../screens/ngo/Campaigns'
import NGOCampaignNew from '../screens/ngo/CampaignNew'
import NGOCampaignDetail from '../screens/ngo/CampaignDetail'
import NGODonors from '../screens/ngo/Donors'
import NGOInsights from '../screens/ngo/Insights'
import NGOAccount from '../screens/ngo/Account'
import NGOSettlements from '../screens/ngo/Settlements'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Welcome />
  },
  {
    path: '/portfolio',
    element: <AppShell accountType="portfolio" />,
    children: [
      { index: true, element: <PortfolioDashboard /> },
      { path: 'transactions', element: <PortfolioTransactions /> },
      { path: 'vault', element: <PortfolioVault /> },
      { path: 'vault/:personId', element: <PortfolioVaultPerson /> },
      { path: 'journey', element: <PortfolioJourney /> },
      { path: 'journey/:positionId', element: <PortfolioJourneyPosition /> },
      { path: 'discover', element: <PortfolioDiscover /> },
      { path: 'discover/:ngoId', element: <PortfolioCauseDetail /> },
    ]
  },
  {
    path: '/borrower',
    element: <AppShell accountType="borrower" />,
    children: [
      { index: true, element: <BorrowerRouter /> },
      { path: 'intake', element: <BorrowerIntake /> },
      { path: 'intake/confirm', element: <BorrowerIntakeConfirm /> },
      { path: 'intake/quick', element: <BorrowerIntakeQuick /> },
      { path: 'verification', element: <BorrowerVerification /> },
      { path: 'review', element: <BorrowerReview /> },
      { path: 'decision', element: <BorrowerDecision /> },
      { path: 'loan', element: <BorrowerLoan /> },
      { path: 'payment', element: <BorrowerPayment /> },
      { path: 'hardship', element: <BorrowerHardship /> },
      { path: 'hardship/extension', element: <BorrowerHardshipExtension /> },
      { path: 'hardship/restructure', element: <BorrowerHardshipRestructure /> },
      { path: 'hardship/conversion', element: <BorrowerHardshipConversion /> },
      { path: 'hardship/success', element: <BorrowerHardshipSuccess /> },
      { path: 'history', element: <BorrowerHistory /> },
      { path: 'account', element: <BorrowerAccount /> },
    ]
  },
  {
    path: '/community',
    element: <AppShell accountType="community" />,
    children: [
      { index: true, element: <CommunityDashboard /> },
      { path: 'setup', element: <CommunitySetup /> },
      { path: 'circles', element: <CommunityCircles /> },
      { path: 'circles/new', element: <CommunityCircleNew /> },
      { path: 'circles/:circleId', element: <CommunityCircleDetail /> },
      { path: 'vouching', element: <CommunityVouching /> },
      { path: 'vouching/:applicantId', element: <CommunityVouchReview /> },
      { path: 'insights', element: <CommunityInsights /> },
    ]
  },
  {
    path: '/ngo',
    element: <AppShell accountType="ngo" />,
    children: [
      { index: true, element: <NGODashboard /> },
      { path: 'setup', element: <NGOSetup /> },
      { path: 'campaigns', element: <NGOCampaigns /> },
      { path: 'campaigns/new', element: <NGOCampaignNew /> },
      { path: 'campaigns/:campaignId', element: <NGOCampaignDetail /> },
      { path: 'donors', element: <NGODonors /> },
      { path: 'insights', element: <NGOInsights /> },
      { path: 'account', element: <NGOAccount /> },
      { path: 'settlements', element: <NGOSettlements /> },
    ]
  }
])
