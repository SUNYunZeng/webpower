function createInstances(data) {
  var instances = [];
  for(var i = 0;i < data.length;i++){
    instances.push(new Cesium.GeometryInstance({
      geometry: new Cesium.PolylineGeometry({
        positions : Cesium.Cartesian3.fromDegreesArray([data[i].lng1,data[i].lat1,  data[i].lng1,data[i].lat2,
          data[i].lng2,data[i].lat2,  data[i].lng2,data[i].lat1,   data[i].lng1,data[i].lat1]),
        width : 2.0
      }),
      id : {
        name : type,
        type : str,
        confidence : data[i].confidence,
        longitude : (data[i].lng1+data[i].lng2)/2,
        latitude : (data[i].lat1+data[i].lat2)/2
      },
      vertexFormat : Cesium.PolylineMaterialAppearance.VERTEX_FORMAT
    }));
  }
  postMessage(instances);
}

onmessage=function(e){
  createInstances(e.data);
};
