'use client'

import Header from '@/components/Header'
import JobForm from '@/components/job-post/JobForm'
import { useGlobalContext } from '@/context/globalContext'
import { useRouter } from 'next/navigation'
import React, { useEffect } from 'react'

function page() {
	const { isAuthenticated, loading } = useGlobalContext()
	const router = useRouter()

	useEffect(() => {
		if (!loading && !isAuthenticated) {
			router.push(
				process.env.NODE_ENV === 'development'
					? 'http://localhost:8000/login'
					: `${process.env.REACT_APP_BASE_URL}/login`
			)
		}
	}, [isAuthenticated])
	return (
		<div className='flex flex-col'>
			<Header />

			<h2 className='flex-1 pt-8 mx-auto w-[90%] text-3xl font-bold text-black'>
				Create a Job Post
			</h2>

			<div className='flex-1 pt-8 w-[90%] mx-auto flex justify-center items-center'>
				<JobForm />
			</div>
		</div>
	)
}

export default page
