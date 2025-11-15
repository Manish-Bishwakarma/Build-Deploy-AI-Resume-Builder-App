import React, { useEffect, useState } from 'react'
import AddResume from './components/AddResume'
import { useUser } from '@clerk/clerk-react'
import GlobalApi from './../../service/GlobalApi';
import ResumeCardItem from './components/ResumeCardItem';

function Dashboard() {

  const {user}=useUser();
  const [resumeList,setResumeList]=useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(()=>{
    user&&GetResumesList()
  },[user])

  /**
   * Used to Get Users Resume List
   */
  const GetResumesList=()=>{
    setLoading(true);
    GlobalApi.GetUserResumes(user?.primaryEmailAddress?.emailAddress)
    .then(resp=>{
      console.log(resp.data.data)
      setResumeList(resp.data.data || []); // Add fallback to empty array
      setLoading(false);
    })
    .catch(error => {
      console.error('Error fetching resumes:', error);
      setResumeList([]); // Set empty array on error
      setLoading(false);
    })
  }
  
  return (
    <div className='p-10 md:px-20 lg:px-32'>
      <h2 className='font-bold text-3xl'>My Resume</h2>
      <p>Start Creating AI resume to your next Job role</p>
      <div className='grid grid-cols-2
      md:grid-cols-3 lg:grid-cols-5 gap-5
      mt-10
      '>
        <AddResume/>
        {/* Add safe check with optional chaining */}
        {(resumeList && resumeList.length > 0) ? resumeList.map((resume,index)=>(
          <ResumeCardItem resume={resume} key={index} refreshData={GetResumesList} />
        )):
        loading ? (
          // Show loading skeletons
          [1,2,3,4].map((item,index)=>(
            <div key={index} className='h-[280px] rounded-lg bg-slate-200 animate-pulse'>
            </div>
          ))
        ) : (
          // Show "no resumes" message when not loading and no data
          <div className='col-span-5 text-center text-gray-500 py-10'>
            <p>No resumes found. Click "Add New" to create your first resume!</p>
          </div>
        )
        }
      </div>
    </div>
  )
}

export default Dashboard