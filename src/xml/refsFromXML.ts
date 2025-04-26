// server.get("/fillrefs", async (req: any, reply) => {
//   // рудимент чтобы заполнить рефки на базе xml
//   reply.header("Access-Control-Allow-Origin", "*");
//   const data = await callStrapi(LinksQuery);
//   const empty = data.exchangers.filter((e: any) => !e.ref_link);
//   const withRefLinks = empty.map((e: any) => ({
//     ...e,
//     ref_link: makeRefLink(e.rates_link),
//   }));
//   // for (let e of withRefLinks) {
//   //   await callStrapi(DeleteExchanger, { id: e.id });
//   //   console.log(`deleted ${e.id}`);
//   //   await sleep(800);
//   // }
//   reply.send(JSON.stringify(withRefLinks));
// });
