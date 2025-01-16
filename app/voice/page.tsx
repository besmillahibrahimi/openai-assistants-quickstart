function Page() {
	return (
		<div className="w-full h-screen flex justify-center items-center">
			<div>
				<form>
					<input name="question" type="text" placeholder="Enter your prompt" />
					<button type="submit">Submit</button>
				</form>
			</div>
		</div>
	);
}

export default Page;
