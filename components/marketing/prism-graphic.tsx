export function PrismGraphic() {
  return (
    <div aria-hidden="true" className="prism-graphic">
      <span className="prism-axis prism-axis-x" />
      <span className="prism-axis prism-axis-y" />
      <span className="prism-axis-label prism-axis-business">BUSINESS DIMENSION</span>
      <span className="prism-axis-label prism-axis-data">DATA DIMENSION</span>
      <span className="prism-polyhedron"><span className="prism-facet" /></span>
      <span className="prism-label prism-label-one"><small>INPUT 01</small><b><i />角色与业务流程</b></span>
      <span className="prism-label prism-label-two"><small>INPUT 02</small><b><i />数据与接口条件</b></span>
      <span className="prism-label prism-label-three"><small>OUTPUT</small><b><i />可验收数字系统</b></span>
    </div>
  );
}
