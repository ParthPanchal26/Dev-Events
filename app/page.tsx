import EventCard from '@/components/EventCard'
import ExploreBtn from '@/components/ExploreBtn'
import { IEvent } from '@/database';
import { cacheLife } from 'next/cache';
// import { events } from '@/lib/constants'


// const events = [
// 	{
// 		image: '/images/event1.png',
// 		title: 'Event 1',
// 		slug: 'event-1',
// 		location: 'location-1',
// 		date: 'date-1',
// 		time: 'time-1',
// 	},
// ]

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URI;
if (!BASE_URL) {
	throw new Error(
		'Missing environment variable: NEXT_PUBLIC_BASE_URI. ' +
		'Add it to your .env file (e.g. NEXT_PUBLIC_BASE_URI=http://localhost:3000).'
	);
}

const Home = async () => {

	'use cache';
	cacheLife('hours')

	const response = await fetch(`${BASE_URL}/api/events`);
	if (!response.ok) throw new Error(`Failed to fetch events: ${response.status} ${response.statusText}`);
	const { events } = await response.json();

	return (
		<section>
			<h1 className='text-center'>The Hub for Every Dev <br /> Event You Can&apos;t  Miss.</h1>
			<p className='text-center mt-5'>Hackathons, Meetups, and conferences, all in One Place</p>

			<ExploreBtn />

			<div className="mt-20 space-y-7">
				<h3>Featured Events</h3>

				<ul className='events'>
					{events && events.length > 0 && events.map((event: IEvent) => (
						<li key={event.title} className='list-none'>
							<EventCard key={event.title} {...event} />
						</li>
					))}
				</ul>
			</div>

		</section>
	)
}

export default Home