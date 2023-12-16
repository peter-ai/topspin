import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Grid, Typography, Box, Stack, Container } from "@mui/material";
import errorGif from "../assets/imgs/error.gif";

export default function NotFound() {
	const [timer, setTimer] = useState(10);
	const navigator = useNavigate();

	useEffect(() => {
		setTimeout(() => setTimer(timer-1), 1000);
		if (timer === 0) {
			navigator('/');
		}
	}, [timer])
	
	return (
		<Container maxWidth='xl'>
			<Grid container mt={4} justifyContent={'center'} alignItems={'center'}>
				<Grid item xs={12}>
					<Box width={'100%'} textAlign={'center'} bgcolor={'#F7504E'}>
						<Box
							component='img'
							width={'30%'}
							sx={{
								maxWidth: 'sm',
								borderRadius: 1,
							}}
							src={ errorGif }
							title="gif of tennis ball walking"
						/>
					</Box>
				</Grid>
				<Grid item xs={12}>
					<Stack spacing={1} alignItems={'center'}>
						<Typography variant="h1">
							Error 404
						</Typography>
						<Typography variant="h2">
							{'Page not found.'}
						</Typography>
						<Box>
						<Typography variant="h5" display={'inline'}>
							Well... this is awkward. The page you're looking for isn't here. We'll redirect you in
						</Typography>
						<Typography variant="h5" display={'inline'} color={'success.main'}>
							{' ' + timer}
						</Typography>
						<Typography variant="h5" display={'inline'}>
							...
						</Typography>
						</Box>
					</Stack>
				</Grid>
			</Grid>
		</Container>
	);
}